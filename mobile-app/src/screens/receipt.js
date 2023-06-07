import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Platform,
  Image,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Divider, Button, Header, Icon } from "react-native-elements";
import StarRating from "react-native-star-rating";
import { colors } from "../common/theme";
var { width } = Dimensions.get("window");
import i18n from "i18n-js";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";
import { useDispatch, useSelector } from "react-redux";
import { FirebaseContext } from "common/src";
import moment from "moment/min/moment-with-locales";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Receipt(props) {
  const { api } = useContext(FirebaseContext);
  const { updateBooking, fetchProfile } = api;
  const dispatch = useDispatch();
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const [starCount, setStarCount] = useState(0);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const activeBookings = useSelector((state) => state.bookinglistdata.active);
  const settings = useSelector((state) => state.settingsdata.settings);
  const { booking } = props.route.params;

  var date = new Date(booking.tripdate).getDate();
  var year = new Date(booking.tripdate).getFullYear();
  var month = new Date(booking.tripdate).getMonth();
  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
                                                                                                  Booking Reference
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
                                                                                                      Vehicle Number
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
                                                                                                                                  ${booking.payment_mode}  - ${booking.customer_name}
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
                                                                                                                                                  <td valign="middle" align="left" style="color:#595959;font-family:open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;white-space:nowrap;direction:ltr;text-align:left">
                                                                                                                                                      2.41 miles | 6 min
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
  const submitNow = () => {
    let curBooking = { ...booking };
    curBooking.rating = booking.rating - 0.1;
    curBooking.status = "COMPLETE";
    dispatch(updateBooking(curBooking));
    Alert.alert("Receipt", "Your receipt is successfully send to your email.");
    props.navigation.navigate("RideListPage");
    console.log(curBooking);
  };

  const generatePdf = async () => {
    const file = await printToFileAsync({
      html: html,
      base64: false,
    });

    await shareAsync(file.uri);
  };

  const alertModal = () => {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={alertModalVisible}
        onRequestClose={() => {
          setAlertModalVisible(false);
        }}
      >
        <View style={styles.alertModalContainer}>
          <View style={styles.alertModalInnerContainer}>
            <View style={styles.alertContainer}>
              <Text style={styles.rideCancelText}>
                {t("no_driver_found_alert_title")}
              </Text>

              <View style={styles.horizontalLLine} />

              <View style={styles.msgContainer}>
                <Text style={styles.cancelMsgText}>{t("thanks")}</Text>
              </View>
              <View
                style={[
                  styles.okButtonContainer,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <Button
                  title={t("no_driver_found_alert_OK_button")}
                  titleStyle={styles.signInTextStyle}
                  onPress={() => {
                    setAlertModalVisible(false);
                    props.navigation.navigate("Map");
                  }}
                  buttonStyle={[
                    styles.okButtonStyle,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                  containerStyle={styles.okButtonContainerStyle}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.WHITE }}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logowhite.png")}
              style={{ width: 150, height: 40 }}
            />
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <Text style={{ fontSize: 18, color: colors.WHITE }}>
                {booking.customer_paid}
              </Text>
              <Text style={{ fontSize: 18, color: colors.WHITE }}>
                {date}.{month}.{year}
              </Text>
            </View>
          </View>
          <View style={styles.nextHeader}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View></View>
              <Image
                source={require("../../assets/images/2022-point-to-pont-express-chevy-suburban-1024x676.png")}
                style={{ width: 150, height: 100 }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: -30,
                marginBottom: 10,
              }}
            >
              <View style={{ width: "50%", marginLeft: 30 }}>
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 25,
                    color: "white",
                  }}
                >
                  Thanks for riding, {booking.customer_name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 18,
                    color: "white",
                    marginTop: 10,
                  }}
                >
                  We hope you enjoyed your ride
                </Text>
              </View>
              <View></View>
            </View>
          </View>
          <View style={styles.body}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Uber Move",
                  fontSize: 25,
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontFamily: "Uber Move",
                  fontSize: 25,
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                {booking.payableAmount}
              </Text>
            </View>
            <View
              style={{
                width: "100%",
                height: 1,
                backgroundColor: "black",
                marginVertical: 15,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Uber Move",
                  fontSize: 18,
                  color: "black",
                  fontWeight: "100",
                }}
              >
                Trip Fare
              </Text>
              <Text
                style={{
                  fontFamily: "Uber Move",
                  fontSize: 18,
                  color: "black",
                  fontWeight: "100",
                }}
              >
                {booking.payableAmount}
              </Text>
            </View>
            <View
              style={{
                width: "100%",
                height: 1,
                backgroundColor: "black",
                marginVertical: 15,
              }}
            />
            <View style={{ flexDirection: "column", justifyContent: "center" }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{display:'flex',flexDirection:'row'}}>
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 18,
                    color: "black",
                    fontWeight: "100",
                    marginBottom:7
                  }}
                >
                  STATUS
                </Text>
                <Icon
                    name={"question-circle"}
                    type={"font-awesome"}
                    size={23}
                    color={colors.BLUE}
                    style={{marginLeft:5}}
                  />
                  </View>
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 18,
                    color: "black",
                    fontWeight: "100",
                  }}
                >
                  {booking.status}
                </Text>

              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{display:'flex',flexDirection:'row',marginBottom:7}}>
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 18,
                    color: "black",
                    fontWeight: "100",
                    marginBottom:7
                  }}
                >
                  Booking Reference
                </Text>
                <Icon
                    name={"question-circle"}
                    type={"font-awesome"}
                    size={23}
                    color={colors.BLUE}
                    style={{marginLeft:5}}
                  />
                  </View>
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 18,
                    color: "black",
                    fontWeight: "100",
                  }}
                >
                  {booking.reference}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{display:'flex',flexDirection:'row'}}>
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 18,
                    color: "black",
                    fontWeight: "100",
                    marginBottom:7
                  }}
                >
                  Vehicle Number
                </Text>
                <Icon
                    name={"question-circle"}
                    type={"font-awesome"}
                    size={23}
                    color={colors.BLUE}
                    style={{marginLeft:5}}
                  />
                  </View>
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 18,
                    color: "black",
                    fontWeight: "100",
                  }}
                >
                  {booking.vehicle_number}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                height: 1,
                backgroundColor: "black",
                marginVertical: 15,
              }}
            />
            <View>
              <Text style={{ fontFamily: "Uber Move", fontSize: 22,fontWeight:'800' }}>
                Payments
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{display:'flex',flexDirection:'row'}}>
                <Icon
                    name={"money"}
                    type={"font-awesome"}
                    size={23}
                    color={colors.BLUE}
                    style={{marginRight:7}}
                  />
                  <Text style={{ fontFamily: "Uber Move", fontSize: 18 }}>
                    {booking.payment_mode} - {booking.customer_name}
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Uber Move",
                    fontSize: 18,
                  }}
                >
                  {booking.customer_paid}
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 10 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Uber Move",
                  fontWeight: "400",
                }}
              >
                A temporary hold of {booking.customer_paid} was placed on your
                payment method {booking.payment_mode}- {booking.customer_name}.
                This is not a change and will be removed. it should dissapear
                from your bank statement shotly.{" "}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.LIGHT_GREY,
                width: "100%",
                marginTop: 20,
              }}
            >
              <View style={{ marginVertical: 20, marginLeft: 20 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      marginBottom: 10,
                    }}
                  >
                    You rode With {booking.driver_name}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", marginBottom: 5 }}>
                  {/* <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Uber Move",
                      marginRight: 2,
                    }}
                  >
                    {booking.driverRating}
                  </Text> */}
                  <Icon
                    name={"star-half"}
                    type={"ionicon"}
                    size={16}
                    color={colors.BLUE}
                    style={{marginTop:2}}
                  />

<Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Uber Move",
                      marginRight: 2,
                      marginLeft: 10
                    }}
                  >
                    {booking.driverRating}
                  </Text>
                  {/* <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Uber Move",
                      marginLeft: 5,
                    }}
                  >
                    Rating
                  </Text> */}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon
                    name={"call"}
                    type={"ionicon"}
                    size={17}
                    color={colors.BLUE}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Uber Move",
                      marginLeft: 5,
                    }}
                  >
                    {booking.driver_contact}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
              <View style={[styles.confBtnStyle,{display:'flex',flexDirection:'row'}]}>
                <Icon
                  name={"envelope"}
                  type={"font-awesome"}
                  size={18}
                  color={colors.BLUE}
                  style={{
                    marginTop:5,
                    
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 19,
                    marginLeft:10
                  }}
                  onPress={() => generatePdf()}
                >
                  Download PDF
                </Text>
              </View>
              <View
                style={{
                  width: "100%",
                  height: 1,
                  backgroundColor: "black",
                  marginVertical: 15,
                }}
              />
              <View
                style={[
                  styles.confBtnStyle,
                  {display:'flex',flexDirection:'row'},
                ]}
              >
                <Icon
                  name={"download"}
                  type={"font-awesome"}
                  size={18}
                  color={colors.BLUE}
                  style={{
                    marginTop:5,

                  }}
                />
                <Text
                  style={{
                    fontFamily: "Uber Move",
                    fontSize: 19,
                    marginLeft:10
                  }}
                  onPress={() =>submitNow() }
                >
                
                  Resend email
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.BLACK,
    padding: 4,
  },
  nextHeader: {
    backgroundColor: colors.BLUE,
    padding: 4,
  },
  body: {
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: colors.WHITE,
    paddingHorizontal: 32,
    marginTop: 20,
  },
});
