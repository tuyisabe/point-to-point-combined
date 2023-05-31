/**
 * eslint no-loop-func: "off"
 *
 * @format
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const valProj = require("regularusedfunctions").valProj;
const validateBasicAuth = require("regularusedfunctions").validateBasicAuth;
const RequestPushMsg = require("./common").RequestPushMsg;
const addToWallet = require("./common").addToWallet;
const deductFromWallet = require("./common").deductFromWallet;
const getDistance = require("./common").getDistance;
const config = require("./config.json");
const addEstimate = require("./common/sharedFunctions").addEstimate;
const translate = require("@iamtraction/google-translate");

exports.googleapis = require("./google-apis");

admin.initializeApp();

var transporter = nodemailer.createTransport(config.smtpDetails);

var arr = [];

const methods = Object.keys(config.paymentMethods);
for (let i = 0; i < methods.length; i++) {
  if (config.paymentMethods[methods[i]].active) {
    exports[methods[i]] = require(`./providers/${methods[i]}`);
    arr.push({
      name: methods[i],
      link: "/" + methods[i] + "-link",
    });
  }
}

exports.get_providers = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  const flag = await valProj(config.firebaseProjectId);
  if (flag.success) {
    response.send(arr);
  } else {
    response.send([]);
  }
});

exports.success = functions.https.onRequest(async (request, response) => {
  const language = Object.values(
    (
      await admin
        .database()
        .ref("languages")
        .orderByChild("default")
        .equalTo(true)
        .once("value")
    ).val()
  )[0].keyValuePairs;
  var amount_line = request.query.amount
    ? `<h3>${language.payment_of}<strong>${request.query.amount}</strong>${language.was_successful}</h3>`
    : "";
  var order_line = request.query.order_id
    ? `<h5>${language.order_no}${request.query.order_id}</h5>`
    : "";
  var transaction_line = request.query.transaction_id
    ? `<h6>${language.transaction_id}${request.query.transaction_id}</h6>`
    : "";
  response.status(200).send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${language.success_payment}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                h3, h6, h4 { margin: 0px; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'>
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/accept-47587_960_720.png' alt='Icon'> 
                    ${amount_line}
                    ${order_line}
                    ${transaction_line}
                    <h4>${language.payment_thanks}</h4>
                </div>
            </div>
            <script type="text/JavaScript">setTimeout("location.href = '${
              request.query.order_id &&
              request.query.order_id.startsWith("wallet")
                ? "/userwallet"
                : "/bookings"
            }';",5000);</script>
        </body>
        </html>
    `);
});

exports.cancel = functions.https.onRequest(async (request, response) => {
  const language = Object.values(
    (
      await admin
        .database()
        .ref("languages")
        .orderByChild("default")
        .equalTo(true)
        .once("value")
    ).val()
  )[0].keyValuePairs;
  response.send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${language.payment_cancelled}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                h3, h6, h4 { margin: 0px; } .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'> 
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/cancel-47588_960_720.png' alt='Icon'> 
                    <h3>${language.payment_fail}</h3> 
                    <h4>${language.try_again}</h4>
                </div> 
            </div>
            <script type="text/JavaScript">setTimeout("location.href = '/bookings';",5000);</script>
        </body>
        </html>
    `);
});

exports.updateBooking = functions.database
  .ref("/bookings/{bookingId}")
  .onUpdate(async (change, context) => {
    let oldrow = change.before.val();
    let booking = change.after.val();
    booking.key = context.params.bookingId;
    if (
      !booking.bookLater &&
      oldrow.status === "PAYMENT_PENDING" &&
      booking.status === "NEW"
    ) {
      admin
        .database()
        .ref("/users")
        .orderByChild("queue")
        .equalTo(false)
        .once("value", (ddata) => {
          let drivers = ddata.val();
          if (drivers) {
            admin
              .database()
              .ref("settings")
              .once("value", async (settingsdata) => {
                let settings = settingsdata.val();
                const langSnap = await admin
                  .database()
                  .ref("languages")
                  .orderByChild("default")
                  .equalTo(true)
                  .once("value");
                const language = Object.values(langSnap.val())[0].keyValuePairs;
                for (let dkey in drivers) {
                  let driver = drivers[dkey];
                  driver.key = dkey;
                  admin
                    .database()
                    .ref("locations/" + dkey)
                    .once("value", (driverlocdata) => {
                      let location = driverlocdata.val();
                      if (
                        driver.usertype === "driver" &&
                        driver.approved === true &&
                        driver.driverActiveStatus === true &&
                        location &&
                        ((driver.carApproved === true &&
                          settings.carType_required) ||
                          !settings.carType_required) &&
                        ((driver.term === true && settings.term_required) ||
                          !settings.term_required) &&
                        ((driver.licenseImage &&
                          settings.license_image_required) ||
                          !settings.license_image_required)
                      ) {
                        let originalDistance = getDistance(
                          booking.pickup.lat,
                          booking.pickup.lng,
                          location.lat,
                          location.lng
                        );
                        if (settings.convert_to_mile) {
                          originalDistance = originalDistance / 1.609344;
                        }
                        if (
                          originalDistance <= settings.driverRadius &&
                          ((driver.carType === booking.carType &&
                            settings.carType_required) ||
                            !settings.carType_required) &&
                          settings.autoDispatch
                        ) {
                          admin
                            .database()
                            .ref(
                              "bookings/" +
                                booking.key +
                                "/requestedDrivers/" +
                                driver.key
                            )
                            .set(true);
                          RequestPushMsg(driver.pushToken, {
                            title: language.notification_title,
                            msg: language.new_booking_notification,
                            screen: "DriverTrips",
                            channelId: settings.CarHornRepeat
                              ? "bookings-repeat"
                              : "bookings",
                            ios: driver.userPlatform === "IOS" ? true : false,
                          });
                        }
                      } else {
                        return false;
                      }
                      return true;
                    });
                }
              });
          } else {
            return false;
          }
          return true;
        });
    }
    if (oldrow.status !== booking.status && booking.status === "CANCELLED") {
      if (
        booking.customer_paid &&
        parseFloat(booking.customer_paid) > 0 &&
        booking.payment_mode !== "cash"
      ) {
        addToWallet(
          booking.customer,
          parseFloat(booking.customer_paid),
          "Admin Credit",
          null
        );
      }
      if (oldrow.status === "ACCEPTED" && booking.cancelledBy === "customer") {
        admin
          .database()
          .ref("tracking/" + booking.key)
          .orderByChild("status")
          .equalTo("ACCEPTED")
          .once("value", (sdata) => {
            let items = sdata.val();
            if (items) {
              let accTime;
              for (let skey in items) {
                accTime = new Date(items[skey].at);
                break;
              }
              let date1 = new Date();
              let date2 = new Date(accTime);
              let diffTime = date1 - date2;
              let diffMins = diffTime / (1000 * 60);
              admin
                .database()
                .ref("cartypes")
                .once("value", async (cardata) => {
                  const cars = cardata.val();
                  let cancelSlab = null;
                  for (let ckey in cars) {
                    if (booking.carType === cars[ckey].name) {
                      cancelSlab = cars[ckey].cancelSlab;
                    }
                  }
                  let deductValue = 0;
                  if (cancelSlab) {
                    for (let i = 0; i < cancelSlab.length; i++) {
                      if (diffMins > parseFloat(cancelSlab[i].minsDelayed)) {
                        deductValue = cancelSlab[i].amount;
                      }
                    }
                  }
                  if (deductValue > 0) {
                    await admin
                      .database()
                      .ref("bookings/" + booking.key + "/cancellationFee")
                      .set(deductValue);
                    deductFromWallet(
                      booking.customer,
                      deductValue,
                      "Cancellation Fee"
                    );
                    addToWallet(
                      booking.driver,
                      deductValue,
                      "Cancellation Fee",
                      null
                    );
                  }
                });
            }
          });
      }
    }
    if (booking.status === "COMPLETE") {
      const language = Object.values(
        (
          await admin
            .database()
            .ref("languages")
            .orderByChild("default")
            .equalTo(true)
            .once("value")
        ).val()
      )[0].keyValuePairs;
      var date = new Date(booking.tripdate).getDate();
      var year = new Date(booking.tripdate).getFullYear();
      var month = new Date(booking.tripdate).getMonth();
      let html = `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                    <meta name="viewport" content="width=device-width">
                    <title>Document</title>
                    <style>
                        @media only screen{
                            html{
                                height:100%;background:#f3f3f3
                            }
                        }
                        @media only screen and (max-width:596px){
                            .small-float-center{
                                margin:0 auto!important;
                                float:none!important;
                                text-align:center!important
                            }
                        }
                        @media only screen and (max-width:596px){
                            table.body img{
                                width:auto;
                                height:auto
                            }
                            table.body center{
                                min-width:0!important
                            }
                            table.body .container{
                                width:95%!important
                            }
                            table.body .columns{
                                height:auto!important;
                                -moz-box-sizing:border-box;
                                -webkit-box-sizing:border-box;
                                box-sizing:border-box;
                                padding-left:16px!important;
                                padding-right:16px!important
                            }
                            table.body .columns .columns{
                                padding-left:0!important;
                                padding-right:0!important
                            }
                            table.body .collapse .columns{
                                padding-left:0!important;
                                padding-right:0!important
                            }
                            th.small-1{
                                display:inline-block!important;
                                width:8.33333%!important
                            }
                            th.small-6{
                                display:inline-block!important;
                                width:50%!important
                            }
                            th.small-12{
                                display:inline-block!important;
                                width:100%!important
                            }
                            .columns th.small-12{
                                display:block!important;
                                width:100%!important
                            }
                            table.menu{
                                width:100%!important
                            }
                            table.menu td,table.menu th{
                                width:auto!important;
                                display:inline-block!important
                            }
                            table.menu.vertical td,table.menu.vertical th{
                                display:block!important
                            }
                            table.menu[align=center]{
                                width:auto!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .header .columns img{
                                padding-left:8px!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .top-ad .ad-img .columns{
                                padding-right:0!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .top-ad .ad-text .columns h1{
                                padding-top:40px!important;
                                width:100%!important;
                                padding-left:8px!important;
                                padding-right:8px!important
                            }
                            .wrapper .top-ad .ad-text .columns h3{
                                padding-left:8px!important;
                                padding-right:8px!important;
                                width:100%!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .top-ad .ad-text{
                                margin-top:0!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .news .intro .columns p{
                                padding-left:8px!important;
                                padding-right:8px!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .news .btn .columns a{
                                margin-left:8px!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .news .pros .gif img{
                                padding-left:8px!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .news .pros .info h2,.wrapper .news .pros .info p{
                                padding-left:8px!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .news .fine-print .columns p{
                                padding-left:8px!important;
                                padding-right:8px!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .footer .columns .row .columns a{
                                margin-left:8px!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .footer .left-menu{
                                padding-bottom:0!important
                            }
                            .wrapper .footer .right-menu{
                                padding-top:0!important;
                                padding-bottom:28px!important
                            }
                        }
                        @media screen and (max-width:596px){
                            .wrapper .footer .location-social-media .location{
                                padding-bottom:12px!important
                            }
                            .wrapper .footer .location-social-media .location p{
                                padding-left:8px!important
                            }
                            .wrapper .footer .location-social-media .location a{
                                padding-left:8px!important
                            }
                            .wrapper .footer .location-social-media .social-media{
                                margin-left:6px!important
                            }
                        }
                        @media screen and (min-width:596px){
                            .top-date-amount{
                                padding-right: 8px;
                            }
                        }
                    </style>
                </head>
                <body style="-moz-box-sizing:border-box;-ms-text-size-adjust:100%;-webkit-box-sizing:border-box;-webkit-text-size-adjust:100%;Margin:0;box-sizing:border-box;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;min-width:100%;padding:0;text-align:left;width:100%!important">
                    <span class="preheader" style="color:#f3f3f3;display:none!important;font-size:1px;line-height:1px;max-height:0;max-width:0;mso-hide:all!important;opacity:0;overflow:hidden;visibility:hidden"></span>
                    <table class="body" style="Margin:0;background:#f3f3f3;border-collapse:collapse;border-spacing:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;height:100%;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;width:100%">
                        <tr style="padding:0;text-align:left;vertical-align:top">
                            <td class="center" align="center" valign="top" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                                <center data-parsed style="min-width:580px;width:100%">
                                    <!-- start of email wrapper -->
                                    <table align="center" class="wrapper float-center" style="Margin:0 auto;background:#d6d6d5;background-color:#d6d6d5;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                            <td class="wrapper-inner" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                                                <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                    <tbody>
                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                            <td height="36pxpx" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:36pxpx;font-weight:400;hyphens:auto;line-height:36pxpx;margin:0;mso-line-height-rule:exactly;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                                                                &#xA0;
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- start of header-container -->
                                                <table align="center" class="container header" style="Margin:0 auto;background:#0a0a0a;background-color:#0a0a0a;border-collapse:collapse;border-spacing:0;margin:0 auto;padding:0;text-align:inherit;vertical-align:top;width:580px">
                                                    <tbody>
                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                            <td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                                                                <table class="row" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                    <tbody>
                                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                                            <th class="small-12 large-12 columns first last" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;width:564px">
                                                                                
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                            <img src="https://point-to-point-express.com/wp-content/uploads/2022/09/logo-white-1024x269.png.webp" alt="Point To Point Express Logo" style="-ms-interpolation-mode:bicubic;clear:both;display:block;max-width:100%;outline:0;padding-bottom:16px;padding-left:60px;padding-top:16px;text-decoration:none;width:12rem">
                                                                                        </th>
                                                                                        <th class="expander" style="Margin:0;color:#fff;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:1.3;margin:0;padding:0!important;text-align:left;width:12rem;text-align:right">
                                                                                            <div class="top-date-amount">
                                                                                                <p >Total $ ${booking.customer_paid}</p>
                                                                                                <p >${date}.${month}.${year}</p>
                                                                                            </div>
                                                                                        </th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- end of header-container -->
                                                <!-- start of whole thanks -->
                                                <table align="center" class="container top-ad" style="Margin:0 auto;background:#1A97F5;background-color:#1A97F5;border-collapse:collapse;border-spacing:0;margin:0 auto;padding:0;text-align:inherit;vertical-align:top;width:580px">
                                                    <tbody>
                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                            <td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                                                                <!-- start of car row -->
                                                                <table class="row ad-img" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                    <tbody>
                                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                                            <th class="small-12 large-12 columns first last" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;width:564px">
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:12rem;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                            <img class="float-right" src="https://point-to-point-express-llc.web.app/static/media/pic10.dc20a336.png" alt="top-added-image" style="-ms-interpolation-mode:bicubic;clear:both;display:block;float:right;max-width:100%;outline:0;text-align:right;text-decoration:none;width:159px">

                                                                                        </th>
                                                                                        <th class="expander" style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0!important;text-align:left;visibility:hidden;width:0"></th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <!-- end of car row -->
                                                                <!-- start of thanks row -->
                                                                <table class="row ad-text" style="border-collapse:collapse;border-spacing:0;display:table;margin-top:-90px;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                    <tbody>
                                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                                            <th class="small-12 large-12 columns first last" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:45px;padding-left:60px;padding-right:0;padding-top:0;text-align:left;width:564px">
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                            <h1 style="Margin:0;Margin-bottom:10px;color:#fefefe;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:44px;font-weight:500;line-height:1.1;margin:0;margin-bottom:0;padding:0;padding-bottom:22px;text-align:left;width:50%;word-wrap:normal">
                                                                                                Thanks for riding, ${booking.customer_name}!
                                                                                            </h1>
                                                                                            <h3 style="Margin:0;Margin-bottom:10px;color:#fefefe;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:24px;font-weight:500;line-height:30px;margin:0;margin-bottom:0;padding:0;text-align:left;width:70%;word-wrap:normal">
                                                                                                We hope you enjoyed your ride 
                                                                                            </h3>
                                                                                        </th>
                                                                                        <th class="expander" style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0!important;text-align:left;visibility:hidden;width:0"></th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <!-- end of thanks row -->
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- end of whole thanks -->

                                                <!-- start of payments-container -->
                                                <table align="center" class="container news" style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;margin:0 auto;padding:0;text-align:inherit;vertical-align:top;width:580px">
                                                    <tbody>
                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                            <td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                                                                <!-- start of intro row -->
                                                                <table class="row intro" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                    <tbody>
                                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                                            <th class="small-12 large-12 columns first last" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:60px;padding-right:60px;padding-top:0;text-align:left;width:564px">
                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%;margin-top: 2rem;">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td valign="top" align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:44px;line-height:44px;padding-right:12px;direction:ltr;text-align:left">
                                                                                                Total
                                                                                            </td>
                                                                                            <td valign="top" align="right" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:44px;line-height:44px;text-align:right;direction:ltr">
                                                                                            ${booking.customer_paid}
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td style="padding-top:26px;padding-bottom:26px">
                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td valign="top" align="left" style="font-size:1px;line-height:1px;background-color:#009eb7">
                                                                                                                                &nbsp;
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td valign="top" align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">
                                                                                                                Trip fare
                                                                                                            </td>
                                                                                                            <td valign="top" align="right" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:0;padding-top:5px;text-align:right;direction:ltr">
                                                                                                            ${booking.customer_paid}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td style="padding-top:26px;padding-bottom:26px">
                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td valign="top" align="left" style="font-size:1px;line-height:1px;background-color:#bdbdbd">
                                                                                                                                &nbsp;
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                               <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td valign="top" align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">
                                                                                                                STATUS
                                                                                                            </td>
                                                                                                            <td valign="top" align="right" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-top:5px;text-align:right;direction:ltr">
                                                                                                            ${booking.status}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td valign="top" align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">
                                                                                                            ${language.booking_ref}
                                                                                                                <a href="#" style="padding-left:5px" rel="noreferrer noreferrer" target="_blank">
                                                                                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1200px-Blue_question_mark_icon.svg.png" width="15" height="15" style="border:none;clear:both;display:inline-block;height:15px;max-width:100%;outline:none;text-decoration:none;width:15px">
                                                                                                                </a>
                                                                                                            </td>
                                                                                                            <td valign="top" align="right" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:0;padding-top:5px;text-align:right;direction:ltr">
                                                                                                            ${booking.reference}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table> 
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td valign="top" align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">
                                                                                                            ${language.vehicle_no}
                                                                                                                <a href="#" style="padding-left:5px" rel="noreferrer noreferrer" target="_blank">
                                                                                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1200px-Blue_question_mark_icon.svg.png" width="15" height="15" style="border:none;clear:both;display:inline-block;height:15px;max-width:100%;outline:none;text-decoration:none;width:15px">
                                                                                                                </a>
                                                                                                            </td>
                                                                                                            <td valign="top" align="right" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:0;padding-top:5px;text-align:right;direction:ltr">
                                                                                                            ${booking.vehicle_number}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td style="padding-top:26px;padding-bottom:26px">
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td valign="top" align="left" style="font-size:1px;line-height:1px;background-color:#bdbdbd">
                                                                                                                &nbsp;
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td align="left" style="padding-left:12px;padding-right:12px;direction:ltr;text-align:left">
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td valign="top" align="left" style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:16px;line-height:20px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">
                                                                                                                Payments
                                                                                                            </td>
                                                                                                            <td valign="top" align="right" style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-top:5px;direction:ltr;text-align:left">
                                                                                                                &nbsp;
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td valign="middle" align="left" style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">
                                                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                                                                                <table align="left" width="initial" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:initial">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                            <td align="left" width="55" style="padding-top:2px;padding-bottom:2px;direction:ltr;text-align:left">
                                                                                                                                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" width="35" height="32" style="clear:both;display:inline-block;height:32px;max-width:100%;outline:none;padding-right:18px;text-decoration:none;vertical-align:middle;width:32px">
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                </table>
                                                                                                                                <table align="left" width="initial" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:initial">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                            <td align="left" style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:16px;line-height:20px;padding-bottom:2px;padding-right:5px;padding-top:2px;direction:ltr;text-align:left;font-weight:bolder">
                                                                                                                                            ${booking.payment_mode} - Paypal - ${booking.customer_name}
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                        <tr>
                                                                                                                                            <td align="left" style="color:#757575;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;padding-bottom:2px;padding-right:5px;padding-top:0;direction:ltr;text-align:left">
                                                                                                                                            ${booking.payment_mode}
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                            </td>
                                                                                                            <td valign="middle" align="right" style="color:#000;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:20px;padding-bottom:10px;padding-top:10px;text-align:right;direction:ltr;vertical-align:top">
                                                                                                            ${booking.customer_paid}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td valign="top" align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:12px;line-height:20px;padding-bottom:10px;padding-right:0;padding-top:10px;direction:ltr;text-align:left">
                                                                                                                A temporary hold of ${booking.customer_paid} was placed on your payment method Venmo - Alex-Njosse. This is not a charge and will be removed. It should disappear from your bank statement shortly.
                                                                                                                <span>
                                                                                                                    <a href="#" rel="noreferrer noreferrer" target="_blank">
                                                                                                                        Learn More
                                                                                                                    </a>
                                                                                                                </span>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;direction:rtl;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td valign="top" align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:0;line-height:28px;padding:5px 12px;text-align:left;direction:ltr">
                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;direction:ltr;display:inline-block;max-width:392px;vertical-align:top;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="padding:6px 0;direction:ltr;text-align:left">
                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:auto;width:100%">
                                                                                                                                                    <tbody>
                                                                                                                                                        <tr>
                                                                                                                                                            <td align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:20px;text-align:left;direction:ltr">
                                                                                                                                                                <a href="#" style="text-decoration:none;color:#276ef1" rel="noreferrer noreferrer" target="_blank">
                                                                                                                                                                    
                                                                                                                                                                </a>
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                    </tbody>
                                                                                                                                                </table>
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td align="left" style="background-color:#f8f8fa;padding:0 14px;direction:ltr;text-align:left">
                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                <table cellpadding="0" cellspacing="0" align="left" style="border:none;border-collapse:collapse;border-spacing:0;max-width:56px;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                            <td style="line-height:1px;font-size:1px;direction:ltr;text-align:left">
                                                                                                                                                &nbsp;
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                                <table cellpadding="0" cellspacing="0" align="left" style="border:none;border-collapse:collapse;border-spacing:0;max-width:616px;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="padding:22px 12px;direction:ltr;text-align:left">
                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                            <td align="left" style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:22px;line-height:28px;direction:ltr;text-align:left;padding-bottom:15px" valign="middle">
                                                                                                                                                You rode with ${booking.driver_name}
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                        <tr>
                                                                                                                                            <td style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:0;line-height:28px;direction:ltr;text-align:left">
                                                                                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse">
                                                                                                                                                    <tbody>
                                                                                                                                                        <tr>
                                                                                                                                                            <td align="left" style="padding-bottom:15px">
                                                                                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;display:inline-block;max-width:224px;vertical-align:top;width:100%">
                                                                                                                                                                    <tbody>
                                                                                                                                                                        <tr>
                                                                                                                                                                            <td style="padding-bottom:10px">
                                                                                                                                                                                <table cellpadding="0" cellspacing="0" width="initial" align="left" style="table-layout:auto">
                                                                                                                                                                                    <tbody>
                                                                                                                                                                                        <tr>
                                                                                                                                                                                            <td align="left" style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;direction:ltr;text-align:left;padding-right:2px" valign="middle">
                                                                                                                                                                                            ${booking.rating}
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td style="padding-right:3px;padding-top:2px" valign="top">
                                                                                                                                                                                                <img src="https://www.shutterstock.com/image-illustration/simple-blue-colour-star-logo-260nw-1917993338.jpg" width="11" height="" style="display:block;width:100%;max-width:11px;height:auto;outline:none;text-decoration:none" alt="">
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;direction:ltr;text-align:left">
                                                                                                                                                                                                Rating
                                                                                                                                                                                            </td>
                                                                                                                                                                                        </tr>
                                                                                                                                                                                    </tbody>
                                                                                                                                                                                </table>
                                                                                                                                                                            </td>
                                                                                                                                                                        </tr>
                                                                                                                                                                    </tbody>
                                                                                                                                                                </table>
                                                                                                                                                                <table cellpadding="0" cellspacing="0" dir="ltr" style="border:none;border-collapse:collapse;border-spacing:0;max-width:336px;width:100%;display:inline-block;vertical-align:top;width:100%">
                                                                                                                                                                    <tbody>
                                                                                                                                                                        <tr>
                                                                                                                                                                            <td style="padding-bottom:10px">
                                                                                                                                                                                <table cellpadding="0" cellspacing="0" width="initial" align="left" style="table-layout:auto">
                                                                                                                                                                                    <tbody>
                                                                                                                                                                                        <tr>
                                                                                                                                                                                            <td style="padding-right:15px">
                                                                                                                                                                                                <img src="https://e7.pngegg.com/pngimages/1004/160/png-clipart-computer-icons-user-profile-social-web-others-blue-social-media.png" width="13" height="" style="border-radius:50%;clear:both;display:block;height:auto;max-height:13px;max-width:13px;outline:none;text-decoration:none;width:13px" >
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;direction:ltr;text-align:left">
                                                                                                                                                                                                Has passed a multi-step safety screen
                                                                                                                                                                                            </td>
                                                                                                                                                                                        </tr>
                                                                                                                                                                                    </tbody>
                                                                                                                                                                                </table>
                                                                                                                                                                            </td>
                                                                                                                                                                        </tr>
                                                                                                                                                                    </tbody>
                                                                                                                                                                </table>
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                        <tr>
                                                                                                                                                            <td valign="top" align="left" style="color:#000;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;padding-bottom:22px;padding-right:12px;padding-top:0;direction:ltr;text-align:left">
                                                                                                                                                                Drivers are critical to communities right now. Say thanks with a tip.
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                        <tr>
                                                                                                                                                            <td>
                                                                                                                                                                <div lang="x-btn" style="font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;text-transform:none">
                                                                                                                                                                    <a href="#" style="background-color:#276ef1;border-color:#276ef1;border-radius:0;border-style:solid;border-width:13px 16px;color:#fff;display:inline-block;letter-spacing:1px;max-width:300px;min-width:100px;text-align:center;text-decoration:none;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif" rel="noreferrer noreferrer" target="_blank">
                                                                                                                                                                        <span style="float:left;text-align:left">
                                                                                                                                                                            Rate or tip
                                                                                                                                                                        </span>
                                                                                                                                                                    </a>
                                                                                                                                                                </div>
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                    </tbody>
                                                                                                                                                </table>
                                                                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;max-width:575px;width:100%">
                                                                                                                                                    <tbody>
                                                                                                                                                        <tr>
                                                                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                                                </table>
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                    </tbody>
                                                                                                                                                </table>
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td align="left" style="background-color:#f8f8fa;padding:0 14px;direction:ltr;text-align:left">
                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;border:none;border-collapse:collapse;border-spacing:0;max-width:560px;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="padding:12px 12px 30px;direction:ltr;text-align:left">
                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                            <td valign="top" align="left" style="color:#4e545b;font-family:helveticaneue-light,helvetica neue light,Helvetica,Arial,sans-serif;font-size:16px;line-height:22px;padding-bottom:10px;padding-right:12px;padding-top:0;direction:ltr;text-align:left">
                                                                                                                                                When you ride with Point To Point Express, your trips are insured in case of a covered accident.
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                        <tr>
                                                                                                                                            <td>
                                                                                                                                                <span lang="x-textcta" align="left" style="font-family:Helvetica,Arial,sans-serif!important;font-size:14px;line-height:20px;text-transform:none;direction:ltr;text-align:left">
                                                                                                                                                    <a href="#" style="text-decoration:none;color:#276ef1" rel="noreferrer noreferrer" target="_blank">
                                                                                                                                                        Learn more<span style="padding-left:2px">❯</span>
                                                                                                                                                    </a>
                                                                                                                                                </span>
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                                <table width="100%" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td align="left" style="background-color:#fff;padding:50px 14px 20px;direction:ltr;text-align:left">
                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td align="center">
                                                                                                                <table cellpadding="0" cellspacing="0" align="left" style="border:none;border-collapse:collapse;border-spacing:0;max-width:56px;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                            <td style="font-size:1px;line-height:1px;height:1px;min-height:1px;direction:ltr;text-align:left">
                                                                                                                                                &nbsp;
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                                <table cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;max-width:616px;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="padding-left:0;padding-right:0;direction:ltr;text-align:left">
                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                                                                                                <table cellpadding="0" cellspacing="0" width="initial" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:auto;width:initial">
                                                                                                                                                    <tbody>
                                                                                                                                                        <tr>
                                                                                                                                                            <td style="padding-left:12px;padding-right:17px;padding-top:1px;direction:ltr;text-align:left" align="left" valign="middle">
                                                                                                                                                                <div style="background-color:#000;border-radius:20px;color:#fff;font-family:open sans,helvetica neue,Helvetica,sans-serif;font-size:12px;line-height:12px;padding:5px 12px">
                                                                                                                                                                    Point To Point Express
                                                                                                                                                                </div>
                                                                                                                                                            </td>

                                                                                                                                                        </tr>
                                                                                                                                                    </tbody>
                                                                                                                                                </table>
                                                                                                                                                <table cellpadding="0" cellspacing="0" align="left" style="border:none;border-collapse:collapse;border-spacing:0;direction:ltr;max-width:280px;width:100%">
                                                                                                                                                    <tbody>
                                                                                                                                                        <tr>
                                                                                                                                                            <td style="padding:20px 12px;direction:ltr;text-align:left">
                                                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                                                    <tbody>
                                                                                                                                                                        <tr>
                                                                                                                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                                                                                                                                <table cellpadding="0" cellspacing="0" width="initial" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:auto;width:100%">
                                                                                                                                                                                    <tbody>
                                                                                                                                                                                        <tr>
                                                                                                                                                                                            <td width="4" style="width:4px;font-size:1px;line-height:1px" valign="top">
                                                                                                                                                                                                <img src="../mobile-app/assets/images/dark_rectangle.png" width="4" height="17" style="clear:both;display:block;height:17px;max-width:100%;outline:none;text-decoration:none;width:4px">
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td style="font-size:1px;line-height:1px;width:1px;background-color:#000" valign="top">
                                                                                                                                                                                                <img src="../mobile-app/assets/images/dark_rectangle.png" width="1" height="17" style="clear:both;display:block;height:17px;max-width:100%;outline:none;text-decoration:none;width:1px">
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td width="3" style="width:3px;font-size:1px;line-height:1px" valign="top">
                                                                                                                                                                                                <img src="../mobile-app/assets/images/dark_rectangle.png" width="3" height="17" style="clear:both;display:block;height:17px;max-width:100%;outline:none;text-decoration:none;width:3px">
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td valign="top" style="color:#000;font-family:open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:28px;padding-left:34px;direction:ltr;text-align:left">
                                                                                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                                                                                    <tbody>
                                                                                                                                                                                                        <tr>
                                                                                                                                                                                                            <td valign="top" align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;direction:ltr;text-align:left">
                                                                                                                                                                                                          
                                                                                                                                                                                                            ${booking.bookingDate}
                                                                                                                                                                                                            </td>
                                                                                                                                                                                                        </tr>
                                                                                                                                                                                                        <tr>
                                                                                                                                                                                                            <td align="left" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;direction:ltr;text-align:left">
                                                                                                                                                                                                            ${booking.pickupAddress}
                                                                                                                                                                                                            </td>
                                                                                                                                                                                                        </tr>
                                                                                                                                                                                                    </tbody>
                                                                                                                                                                                                </table>
                                                                                                                                                                                            </td>
                                                                                                                                                                                        </tr>
                                                                                                                                                                                    </tbody>
                                                                                                                                                                                </table>
                                                                                                                                                                                <table cellpadding="0" cellspacing="0" width="initial" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:auto;width:100%">
                                                                                                                                                                                    <tbody>
                                                                                                                                                                                        <tr>
                                                                                                                                                                                            <td width="4" style="width:4px;font-size:1px;line-height:1px" valign="top">
                                                                                                                                                                                                <img src="../mobile-app/assets/images/dark_rectangle.png" width="4" height="17" style="clear:both;display:block;height:17px;max-width:100%;outline:none;text-decoration:none;width:4px">
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td style="font-size:1px;line-height:1px;width:1px;background-color:#fff" valign="top">
                                                                                                                                                                                                <img src="../mobile-app/assets/images/middle_low_dark_rect.png" width="1" height="20" style="clear:both;display:block;height:20px;max-width:100%;outline:none;text-decoration:none;width:1px">
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td width="3" style="width:3px;font-size:1px;line-height:1px" valign="top">
                                                                                                                                                                                                <img src="../mobile-app/assets/images/dark_rectangle.png" width="3" height="17" style="clear:both;display:block;height:17px;max-width:100%;outline:none;text-decoration:none;width:3px">
                                                                                                                                                                                            </td>
                                                                                                                                                                                            <td valign="top" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:16px;padding-left:34px;direction:ltr;text-align:left">
                                                                                                                                                                                                <table cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                                                                                    <tbody>
                                                                                                                                                                                                        <tr>
                                                                                                                                                                                                            <td valign="top" style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;direction:ltr;text-align:left">
                                                                                                                                                                                                            ${booking.trip_end_time}
                                                                                                                                                                                                            </td>
                                                                                                                                                                                                        </tr>
                                                                                                                                                                                                        <tr>
                                                                                                                                                                                                            <td style="color:#000;font-family: open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;direction:ltr;text-align:left">
                                                                                                                                                                                                            ${booking.dropAddress}
                                                                                                                                                                                                            </td>
                                                                                                                                                                                                        </tr>
                                                                                                                                                                                                    </tbody>
                                                                                                                                                                                                </table>
                                                                                                                                                                                            </td>
                                                                                                                                                                                        </tr>
                                                                                                                                                                                    </tbody>
                                                                                                                                                                                </table>
                                                                                                                                                                            </td>
                                                                                                                                                                        </tr>
                                                                                                                                                                    </tbody>
                                                                                                                                                                </table>
                                                                                                                                                            </td>
                                                                                                                                                        </tr>
                                                                                                                                                    </tbody>
                                                                                                                                                </table>
                                                                                                                                            </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </th>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- end of payments-container -->

                                                <!-- end of news-container --><!-- start of footer-container -->
                                                <table align="center" class="container footer" style="Margin:0 auto;background:#0a0a0a;background-color:#0a0a0a;border-collapse:collapse;border-spacing:0;margin:0 auto;padding:0;text-align:inherit;vertical-align:top;width:580px">
                                                    <tbody>
                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                            <td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                                                                <!-- start of menu row -->
                                                                <div style="color:white; width:100%; background-color: #1A97F5;">
                                                                    <table class="row" style="width:100%">
                                                                        <tr>
                                                                            <td style="padding: 1rem;">
                                                                                <a href="#" style="color: #fff;font-family:  open sans,helvetica neue,Helvetica,sans-serif;font-size: 14px;line-height: 16px;padding: 2px 0;text-decoration: none;">Report lost item<span style="padding-left:10px">❯</span></a>
                                                                            </td>
                                                                            <td style="padding: 1rem;">
                                                                                <a href="#" style="color: #fff;font-family:  open sans,helvetica neue,Helvetica,sans-serif;font-size: 14px;line-height: 16px;padding: 2px 0;text-decoration: none;">Contact support<span style="padding-left:10px">❯</span></a>
                                                                            </td>
                                                                            <td style="padding: 1rem;">
                                                                                <a href="#" style="color: #fff;font-family:  open sans,helvetica neue,Helvetica,sans-serif;font-size: 14px;line-height: 16px;padding: 2px 0;text-decoration: none;">My trips<span style="padding-left:10px">❯</span></a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </div>
                                                                <table class="row" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                    <tbody>
                                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                                            <th class="left-menu small-12 large-3 columns first" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:28px;padding-left:60px;padding-right:0;padding-top:35px;text-align:left;width:129px">
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                            
                                                                                            <table class="row" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                                                <tbody>
                                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                                        <th class="small-12 large-12 columns first last" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0!important;padding-right:0!important;padding-top:0;text-align:left;width:100%">
                                                                                                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                                                <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                                                    <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                                                        <a href="#/" style="Margin:0;color:#fefefe;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:2;margin:0;padding:0;text-align:left;text-decoration:none">
                                                                                                                            Terms
                                                                                                                        </a>
                                                                                                                    </th>
                                                                                                                    <th class="expander" style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0!important;text-align:left;visibility:hidden;width:0">
                                                                                                                    </th>
                                                                                                                </tr>
                                                                                                            </table>
                                                                                                        </th>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                            
                                                                                        </th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                            <th class="right-menu small-12 large-3 columns" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:28px;padding-left:0;padding-right:0;padding-top:35px;text-align:left;width:129px">
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                            <table class="row" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                                                <tbody>
                                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                                        <th class="small-12 large-12 columns first last" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0!important;padding-right:0!important;padding-top:0;text-align:left;width:100%">
                                                                                                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                                                <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                                                    <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                                                        <a href="#/" style="Margin:0;color:#fefefe;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:2;margin:0;padding:0;text-align:left;text-decoration:none">
                                                                                                                            Privacy
                                                                                                                        </a>
                                                                                                                    </th>
                                                                                                                    <th class="expander" style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0!important;text-align:left;visibility:hidden;width:0">
                                                                                                                    </th>
                                                                                                                </tr>
                                                                                                            </table>
                                                                                                        </th>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                            
                                                                                        </th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                            <th class="spacer small-12 large-6 columns last" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;width:274px">
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                        </th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <!-- end of menu row --><!-- start of location-social-media row -->
                                                                <table class="row location-social-media" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                    <tbody>
                                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                                            <th class="location col small-12 large-7 columns first" valign="top" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:50px;padding-left:60px;padding-right:0;padding-top:0;text-align:left;width:322.33px">
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                            <p style="Margin:0;Margin-bottom:10px;color:#fefefe;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:1.8;margin:0;margin-bottom:0;padding:0;text-align:left">
                                                                                                Point To Point Express
                                                                                            </p>
                                                                                            <p style="Margin:0;Margin-bottom:10px;color:#fefefe;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:1.8;margin:0;margin-bottom:0;padding:0;text-align:left">
                                                                                                Salt Lake City, Utah 84111
                                                                                            </p>
                                                                                            <a href="#/" style="Margin:0;color:#fefefe;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:1.8;margin:0;padding:0;text-align:left;text-decoration:none">
                                                                                                info@point-to-point-express.com
                                                                                            </a>
                                                                                        </th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                            <th class="social-media col small-12 large-3 columns" valign="top" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:50px;padding-left:20px;padding-right:0;padding-top:0;text-align:left;width:129px">
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                            <table class="row" style="border-collapse:collapse;border-spacing:0;display:table;padding:0;position:relative;text-align:left;vertical-align:top;width:100%">
                                                                                                <tbody>
                                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                                        <th class="small-1 large-1 columns first" valign="middle" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0!important;padding-right:0!important;padding-top:0;text-align:left;width:8.33333%">
                                                                                                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                                                <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                                                    <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                                                        <a href="#/" style="Margin:0;color:#fefefe;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:2;margin:0;padding:0;text-align:left;text-decoration:none">
                                                                                                                            <img src="https://i.postimg.cc/63Cp77RN/facebook-icon.png" alt="facebook-icon" style="-ms-interpolation-mode:bicubic;border:none;clear:both;display:block;max-width:100%;outline:0;text-decoration:none;width:13px">
                                                                                                                        </a>
                                                                                                                    </th>
                                                                                                                </tr>
                                                                                                            </table>
                                                                                                        </th>
                                                                                                        <th class="small-1 large-1 columns" valign="bottom" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0!important;padding-right:0!important;padding-top:0;text-align:left;width:8.33333%">
                                                                                                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                                                <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                                                    <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                                                        <a href="#/" style="Margin:0;color:#fefefe;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:2;margin:0;padding:0;text-align:left;text-decoration:none">
                                                                                                                            <img src="https://i.postimg.cc/q7hRTDvq/twitter-icon.png" alt="twitter-icon" style="-ms-interpolation-mode:bicubic;border:none;clear:both;display:block;max-width:100%;outline:0;text-decoration:none;width:17px">
                                                                                                                        </a>
                                                                                                                    </th>
                                                                                                                </tr>
                                                                                                            </table>
                                                                                                        </th>
                                                                                                        <th class="small-1 large-1 columns last" valign="bottom" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0!important;padding-right:0!important;padding-top:0;text-align:left;width:8.33333%">
                                                                                                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                                                <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                                                    <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                                                        <a href="#/" style="Margin:0;color:#fefefe;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;line-height:2;margin:0;padding:0;text-align:left;text-decoration:none">
                                                                                                                            <img src="https://i.postimg.cc/jSk5BYKB/instagram-icon.png" alt="instagram-icon" style="-ms-interpolation-mode:bicubic;border:none;clear:both;display:block;max-width:100%;outline:0;text-decoration:none;width:16px">
                                                                                                                        </a>
                                                                                                                    </th>
                                                                                                                </tr>
                                                                                                            </table>
                                                                                                        </th>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                            <th class="small-12 large-2 columns last" style="Margin:0 auto;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;text-align:left;width:80.67px">
                                                                                <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                                                    <tr style="padding:0;text-align:left;vertical-align:top">
                                                                                        <th style="Margin:0;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left">
                                                                                        </th>
                                                                                    </tr>
                                                                                </table>
                                                                            </th>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                                <!-- end of location-social-media row -->
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!-- end of footer-container -->
                                                <table class="spacer" style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                                                    <tbody>
                                                        <tr style="padding:0;text-align:left;vertical-align:top">
                                                            <td height="36pxpx" style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:36pxpx;font-weight:400;hyphens:auto;line-height:36pxpx;margin:0;mso-line-height-rule:exactly;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                                                                &#xA0;
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    <!-- end of email wrapper -->
                                </center>
                            </td>
                        </tr>
                    </table>
                    <!-- prevent Gmail on iOS font size manipulation -->
                    <div style="display:none;white-space:nowrap;font:15px courier;line-height:0">
                        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    </div>
                </body>
            </html>`;
      transporter
        .sendMail({
          from: config.smtpDetails.from
            ? config.smtpDetails.from
            : config.smtpDetails.auth.user,
          to: booking.customer_email,
          subject: language.ride_details_page_title,
          html: html,
        })
        .then((res) => console.log("successfully sent that mail"))
        .catch((err) => console.log(err));
    }
    if (
      booking.payment_mode === "wallet" &&
      ((oldrow.status === "PAYMENT_PENDING" &&
        booking.status === "NEW" &&
        booking.prepaid) ||
        (oldrow.status === "PENDING" &&
          booking.status === "PAID" &&
          !booking.prepaid) ||
        (oldrow.status === "REACHED" &&
          booking.status === "COMPLETE" &&
          !booking.prepaid) ||
        (oldrow.status === "NEW" &&
          booking.status === "ACCEPTED" &&
          booking.prepaid &&
          !(booking.customer_paid && parseFloat(booking.customer_paid) >= 0)) ||
        (oldrow.status === "NEW" &&
          booking.status === "ACCEPTED" &&
          oldrow.selectedBid &&
          !booking.selectedBid &&
          booking.prepaid))
    ) {
      const snapshot = await admin
        .database()
        .ref("users/" + booking.customer)
        .once("value");
      let profile = snapshot.val();
      const settingdata = await admin.database().ref("settings").once("value");
      let settings = settingdata.val();
      let walletBal =
        parseFloat(profile.walletBalance) -
        parseFloat(
          parseFloat(booking.trip_cost) - parseFloat(booking.discount)
        );
      let tDate = new Date();
      let details = {
        type: "Debit",
        amount: parseFloat(
          parseFloat(booking.trip_cost) - parseFloat(booking.discount)
        ),
        date: tDate.getTime(),
        txRef: booking.id,
      };
      await admin
        .database()
        .ref("users/" + booking.customer)
        .update({
          walletBalance: parseFloat(
            parseFloat(walletBal).toFixed(settings.decimal)
          ),
        });
      await admin
        .database()
        .ref("walletHistory/" + booking.customer)
        .push(details);
      const langSnap = await admin
        .database()
        .ref("languages")
        .orderByChild("default")
        .equalTo(true)
        .once("value");
      const language = Object.values(langSnap.val())[0].keyValuePairs;
      RequestPushMsg(profile.pushToken, {
        title: language.notification_title,
        msg: language.wallet_updated,
        screen: "Wallet",
        ios: profile.userPlatform === "IOS" ? true : false,
      });
    }
    if (
      (oldrow.status === "REACHED" && booking.status === "PAID") ||
      (oldrow.status === "PENDING" && booking.status === "PAID") ||
      (oldrow.status === "PENDING" && booking.status === "COMPLETE") ||
      (oldrow.status === "REACHED" && booking.status === "COMPLETE")
    ) {
      const snapshotDriver = await admin
        .database()
        .ref("users/" + booking.driver)
        .once("value");
      let profileDriver = snapshotDriver.val();
      const settingdata = await admin.database().ref("settings").once("value");
      let settings = settingdata.val();
      let driverWalletBal = parseFloat(profileDriver.walletBalance);
      if (
        booking.payment_mode === "cash" &&
        booking.cashPaymentAmount &&
        parseFloat(booking.cashPaymentAmount) > 0
      ) {
        let details = {
          type: "Debit",
          amount: booking.cashPaymentAmount,
          date: new Date().getTime(),
          txRef: booking.id,
        };
        await admin
          .database()
          .ref("walletHistory/" + booking.driver)
          .push(details);
        driverWalletBal =
          driverWalletBal - parseFloat(booking.cashPaymentAmount);
      }
      driverWalletBal = driverWalletBal + parseFloat(booking.driver_share);
      let driverDetails = {
        type: "Credit",
        amount: booking.driver_share,
        date: new Date().getTime(),
        txRef: booking.id,
      };
      await admin
        .database()
        .ref("users/" + booking.driver)
        .update({
          walletBalance: parseFloat(
            parseFloat(driverWalletBal).toFixed(settings.decimal)
          ),
        });
      await admin
        .database()
        .ref("walletHistory/" + booking.driver)
        .push(driverDetails);
      const langSnap = await admin
        .database()
        .ref("languages")
        .orderByChild("default")
        .equalTo(true)
        .once("value");
      const language = Object.values(langSnap.val())[0].keyValuePairs;
      RequestPushMsg(profileDriver.pushToken, {
        title: language.notification_title,
        msg: language.wallet_updated,
        screen: "Wallet",
        ios: profileDriver.userPlatform === "IOS" ? true : false,
      });
    }
  });

exports.withdrawCreate = functions.database
  .ref("/withdraws/{wid}")
  .onCreate(async (snapshot, context) => {
    let wid = context.params.wid;
    let withdrawInfo = snapshot.val();
    let uid = withdrawInfo.uid;
    let amount = withdrawInfo.amount;

    const userData = await admin
      .database()
      .ref("users/" + uid)
      .once("value");
    let profile = userData.val();
    const settingdata = await admin.database().ref("settings").once("value");
    let settings = settingdata.val();
    let walletBal = parseFloat(profile.walletBalance) - parseFloat(amount);

    let tDate = new Date();
    let details = {
      type: "Withdraw",
      amount: amount,
      date: tDate.getTime(),
      txRef: tDate.getTime().toString(),
      transaction_id: wid,
    };
    await admin
      .database()
      .ref("users/" + uid)
      .update({
        walletBalance: parseFloat(
          parseFloat(walletBal).toFixed(settings.decimal)
        ),
      });
    await admin
      .database()
      .ref("walletHistory/" + uid)
      .push(details);
    const langSnap = await admin
      .database()
      .ref("languages")
      .orderByChild("default")
      .equalTo(true)
      .once("value");
    const language = Object.values(langSnap.val())[0].keyValuePairs;
    RequestPushMsg(profile.pushToken, {
      title: language.notification_title,
      msg: language.wallet_updated,
      screen: "Wallet",
      ios: profile.userPlatform === "IOS" ? true : false,
    });
  });

exports.bookingScheduler = functions.pubsub
  .schedule("every 5 minutes")
  .onRun((context) => {
    admin
      .database()
      .ref("/bookings")
      .orderByChild("status")
      .equalTo("NEW")
      .once("value", (snapshot) => {
        let bookings = snapshot.val();
        if (bookings) {
          for (let key in bookings) {
            let booking = bookings[key];
            booking.key = key;
            let date1 = new Date();
            let date2 = new Date(booking.tripdate);
            let diffTime = date2 - date1;
            let diffMins = diffTime / (1000 * 60);
            if (
              (diffMins > 0 &&
                diffMins < 15 &&
                booking.bookLater &&
                !booking.requestedDrivers) ||
              diffMins < -5
            ) {
              admin
                .database()
                .ref("/users")
                .orderByChild("queue")
                .equalTo(false)
                .once("value", (ddata) => {
                  let drivers = ddata.val();
                  if (drivers) {
                    admin
                      .database()
                      .ref("settings")
                      .once("value", async (settingsdata) => {
                        let settings = settingsdata.val();
                        const langSnap = await admin
                          .database()
                          .ref("languages")
                          .orderByChild("default")
                          .equalTo(true)
                          .once("value");
                        const language = Object.values(langSnap.val())[0]
                          .keyValuePairs;
                        for (let dkey in drivers) {
                          let driver = drivers[dkey];
                          driver.key = dkey;
                          if (
                            !(
                              booking.requestedDrivers &&
                              booking.requestedDrivers[dkey]
                            )
                          ) {
                            admin
                              .database()
                              .ref("locations/" + dkey)
                              .once("value", (driverlocdata) => {
                                let location = driverlocdata.val();
                                if (
                                  driver.usertype === "driver" &&
                                  driver.approved === true &&
                                  driver.driverActiveStatus === true &&
                                  location &&
                                  ((driver.carApproved === true &&
                                    settings.carType_required) ||
                                    !settings.carType_required) &&
                                  ((driver.term === true &&
                                    settings.term_required) ||
                                    !settings.term_required) &&
                                  ((driver.licenseImage &&
                                    settings.license_image_required) ||
                                    !settings.license_image_required)
                                ) {
                                  let originalDistance = getDistance(
                                    booking.pickup.lat,
                                    booking.pickup.lng,
                                    location.lat,
                                    location.lng
                                  );
                                  if (settings.convert_to_mile) {
                                    originalDistance =
                                      originalDistance / 1.609344;
                                  }
                                  if (
                                    originalDistance <= settings.driverRadius &&
                                    ((driver.carType === booking.carType &&
                                      settings.carType_required) ||
                                      !settings.carType_required) &&
                                    settings.autoDispatch
                                  ) {
                                    admin
                                      .database()
                                      .ref(
                                        "bookings/" +
                                          booking.key +
                                          "/requestedDrivers/" +
                                          driver.key
                                      )
                                      .set(true);
                                    addEstimate(
                                      booking.key,
                                      driver.key,
                                      originalDistance
                                    );
                                    RequestPushMsg(driver.pushToken, {
                                      title: language.notification_title,
                                      msg: language.new_booking_notification,
                                      screen: "DriverTrips",
                                      channelId: settings.CarHornRepeat
                                        ? "bookings-repeat"
                                        : "bookings",
                                      ios:
                                        driver.userPlatform === "IOS"
                                          ? true
                                          : false,
                                    });
                                    return true;
                                  }
                                  return true;
                                } else {
                                  return false;
                                }
                              });
                          }
                        }
                      });
                  } else {
                    return false;
                  }
                  return true;
                });
            }
            if (diffMins < -30) {
              admin
                .database()
                .ref("bookings/" + booking.key + "/requestedDrivers")
                .remove();
              admin
                .database()
                .ref("bookings/" + booking.key)
                .update({
                  status: "CANCELLED",
                  reason: "RIDE AUTO CANCELLED. NO RESPONSE",
                  cancelledBy: "admin",
                });
              return true;
            }
          }
        } else {
          return false;
        }
        return true;
      });
  });

exports.userDelete = functions.database
  .ref("/users/{uid}")
  .onDelete((snapshot, context) => {
    let uid = context.params.uid;
    return admin.auth().deleteUser(uid);
  });

exports.userCreate = functions.database
  .ref("/users/{uid}")
  .onCreate((snapshot, context) => {
    let uid = context.params.uid;
    let userInfo = snapshot.val();
    let userCred = { uid: uid };
    if (userInfo.mobile) {
      userCred["phoneNumber"] = userInfo.mobile;
    }
    if (userInfo.email) {
      userCred["email"] = userInfo.email;
    }
    admin
      .auth()
      .getUser(uid)
      .then((userRecord) => {
        return true;
      })
      .catch((error) => {
        admin.auth().createUser(userCred);
      });
  });

exports.send_notification = functions.https.onRequest(
  async (request, response) => {
    let settingdata = await admin.database().ref("settings").once("value");
    let settings = settingdata.val();
    const allowedOrigins = [
      "https://" + config.firebaseProjectId + ".web.app",
      settings.CompanyWebsite,
    ];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
      response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Headers", "Content-Type");
    if (request.body.token === "token_error" || request.body.token === "web") {
      response.send({ error: "Token found as " + request.body.token });
    } else {
      let data = {
        title: request.body.title,
        msg: request.body.msg,
      };
      if (request.body.screen) {
        data["screen"] = request.body.screen;
      }
      if (request.body.params) {
        data["params"] = request.body.params;
      }
      if (request.body.channelId) {
        data["channelId"] = request.body.channelId;
      }
      if (request.body.ios) {
        data["ios"] = request.body.ios;
      }
      RequestPushMsg(request.body.token, data)
        .then((responseData) => {
          response.send(responseData);
          return true;
        })
        .catch((error) => {
          response.send({ error: error });
        });
    }
  }
);

exports.check_user_exists = functions.https.onRequest(
  async (request, response) => {
    let settingdata = await admin.database().ref("settings").once("value");
    let settings = settingdata.val();
    const allowedOrigins = [
      "https://" + config.firebaseProjectId + ".web.app",
      settings.CompanyWebsite,
    ];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
      response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Headers", "Content-Type");
    let arr = [];
    const user = await validateBasicAuth(request.headers.authorization, config);
    if (user) {
      if (request.body.email || request.body.mobile) {
        if (request.body.email) {
          arr.push({ email: request.body.email });
        }
        if (request.body.mobile) {
          arr.push({ phoneNumber: request.body.mobile });
        }
        try {
          admin
            .auth()
            .getUsers(arr)
            .then((getUsersResult) => {
              response.send({ users: getUsersResult.users });
              return true;
            })
            .catch((error) => {
              response.send({ error: error });
            });
        } catch (error) {
          response.send({ error: error });
        }
      } else {
        response.send({ error: "Email or Mobile not found." });
      }
    } else {
      response.send({ error: "Unauthorized api call" });
    }
  }
);

exports.validate_referrer = functions.https.onRequest(
  async (request, response) => {
    let referralId = request.body.referralId;
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const snapshot = await admin.database().ref("users").once("value");
    let value = snapshot.val();
    if (value) {
      let arr = Object.keys(value);
      let key;
      for (let i = 0; i < arr.length; i++) {
        if (value[arr[i]].referralId === referralId) {
          key = arr[i];
        }
      }
      response.send({ uid: key });
    } else {
      response.send({ uid: null });
    }
  }
);

exports.user_signup = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  let userDetails = request.body.regData;
  const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const reference = [...Array(5)]
    .map((_) => c[~~(Math.random() * c.length)])
    .join("");
  try {
    const flag = await valProj(config.firebaseProjectId);
    if (flag.success) {
      let regData = {
        createdAt: new Date().getTime(),
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        mobile: userDetails.mobile,
        email: userDetails.email,
        usertype: userDetails.usertype,
        referralId: reference,
        approved: true,
        walletBalance: 0,
        pushToken: "init",
        signupViaReferral: userDetails.signupViaReferral
          ? userDetails.signupViaReferral
          : " ",
      };
      let settingdata = await admin.database().ref("settings").once("value");
      let settings = settingdata.val();
      let userRecord = await admin.auth().createUser({
        email: userDetails.email,
        phoneNumber: userDetails.mobile,
        password: userDetails.password,
        emailVerified: true,
      });
      if (userDetails.usertype === "driver") {
        regData.queue = false;
        regData.driverActiveStatus = false;
        if (settings.driver_approval) {
          regData.approved = false;
        }
      }
      if (userRecord && userRecord.uid) {
        await admin
          .database()
          .ref("users/" + userRecord.uid)
          .set(regData);
        if (userDetails.signupViaReferral && settings.bonus > 0) {
          await addToWallet(
            userDetails.signupViaReferral,
            settings.bonus,
            "Admin Credit",
            null
          );
          await addToWallet(
            userRecord.uid,
            settings.bonus,
            "Admin Credit",
            null
          );
        }
        response.send({ uid: userRecord.uid });
      } else {
        response.send({ error: "User Not Created" });
      }
    } else {
      response.send({ error: "Setup Error" });
    }
  } catch (error) {
    response.send({ error: "User Not Created" });
  }
});

exports.update_user_email = functions.https.onRequest(
  async (request, response) => {
    let settingdata = await admin.database().ref("settings").once("value");
    let settings = settingdata.val();
    const allowedOrigins = [
      "https://" + config.firebaseProjectId + ".web.app",
      settings.CompanyWebsite,
    ];
    const origin = request.headers.origin;
    if (allowedOrigins.includes(origin)) {
      response.set("Access-Control-Allow-Origin", origin);
    }
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateBasicAuth(request.headers.authorization, config);
    if (user) {
      const uid = request.body.uid;
      const email = request.body.email;
      if (email) {
        admin
          .auth()
          .updateUser(uid, {
            email: email,
            emailVerified: true,
          })
          .then((userRecord) => {
            let updateData = { uid: uid, email: email };
            if (request.body.firstName) {
              updateData["firstName"] = request.body.firstName;
            }
            if (request.body.lastName) {
              updateData["lastName"] = request.body.lastName;
            }
            admin
              .database()
              .ref("users/" + uid)
              .update(updateData);
            response.send({ success: true, user: userRecord });
            return true;
          })
          .catch((error) => {
            response.send({ error: "Error updating user" });
          });
      } else {
        response.send({ error: "Request email not found" });
      }
    } else {
      response.send({ error: "Unauthorized api call" });
    }
  }
);

exports.gettranslation = functions.https.onRequest((request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  translate(request.query.str, {
    from: request.query.from,
    to: request.query.to,
  })
    .then((res) => {
      response.send({ text: res.text });
      return true;
    })
    .catch((err) => {
      response.send({ error: err.toString() });
      return false;
    });
});

exports.getservertime = functions.https.onRequest((request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  response.send({ time: new Date().getTime() });
});
