const admin = require('firebase-admin');

module.exports.UpdateBooking = (bookingData,order_id,transaction_id,gateway) => {
    let curChanges = {
        status:  bookingData.booking_from_web? 'COMPLETE': 'PAID',
        prepaid: false,
        transaction_id: transaction_id,
        gateway: gateway
    }
    Object.assign(curChanges, bookingData.paymentPacket);
    admin.database().ref('bookings').child(order_id).update(curChanges);
    admin.database().ref('users').child(bookingData.driver).update({queue:false});
}

module.exports.addEstimate = (bookingId, driverId, distance) => {
    return true;
}