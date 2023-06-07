import React, { useRef } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    Modal,
    StatusBar,
    ScrollView
} from 'react-native';
import { Icon, Button, Input } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import i18n from 'i18n-js';
import RadioForm from 'react-native-simple-radio-button';

const hasNotch = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && ((height === 780 || width === 780) || (height === 812 || width === 812) || (height === 844 || width === 844) || (height === 896 || width === 896) || (height === 926 || width === 926))

export default function TaxiModal(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const { settings, tripdata, estimate, bookingModalStatus, onPressCancel, bookNow, payment_mode, setPaymentMode, radioProps, profileData, setProfileData, auth, bookModelLoading } = props;

    const mapRef = useRef(null);

    const runFitCoords = () => {
        mapRef.current.fitToCoordinates([{ latitude: tripdata.pickup.lat, longitude: tripdata.pickup.lng }, { latitude: tripdata.drop.lat, longitude: tripdata.drop.lng }], {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true,
        });
    };

    return (
        <View>
            <StatusBar
                hidden={false}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={bookingModalStatus}
                onShow={runFitCoords}
            >
                <View style={styles.container}>
                    <View style={styles.mapcontainer}>
                        {tripdata && tripdata.pickup && tripdata.drop ?
                            <MapView
                                ref={mapRef}
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={{
                                    latitude: (tripdata.pickup.lat),
                                    longitude: (tripdata.pickup.lng),
                                    latitudeDelta: 0.9922,
                                    longitudeDelta: 1.9421
                                }}
                                minZoomLevel={13}
                            >
                                <Marker
                                    coordinate={{ latitude: (tripdata.pickup.lat), longitude: (tripdata.pickup.lng) }}
                                    title={tripdata.pickup.add}
                                    pinColor={colors.GREEN_DOT}
                                >
                                </Marker>
                                <Marker
                                    coordinate={{ latitude: (tripdata.drop.lat), longitude: (tripdata.drop.lng) }}
                                    title={tripdata.drop.add}
                                >
                                </Marker>

                                {estimate && estimate.waypoints ?
                                    <Polyline
                                        coordinates={estimate.waypoints}
                                        strokeWidth={5}
                                        strokeColor={colors.INDICATOR_BLUE}
                                        //lineDashPattern={[1]}
                                    />
                                    : null}

                                {tripdata.drop && tripdata.drop.waypoints && tripdata.drop.waypoints.length > 0 ? tripdata.drop.waypoints.map((item, index) => {
                                    return (
                                        <Marker
                                            coordinate={{ latitude: item.lat, longitude: item.lng }}
                                            pinColor={colors.RED}
                                            title={item.add}
                                            key={index}
                                        >
                                        </Marker>

                                    )
                                })
                                    : null}
                            </MapView>
                            : null}
                    </View>
                    <View style={[styles.addressBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <View style={styles.ballandsquare}>
                            <View style={styles.hbox1} /><View style={styles.hbox2} /><View style={styles.hbox3} />
                        </View>
                        {tripdata && tripdata.pickup && tripdata.drop ?
                            <View style={[styles.contentStyle, isRTL ? { paddingRight: 10 } : { paddingLeft: 10 }]}>
                                <TouchableOpacity style={styles.addressStyle1}>
                                    <Text numberOfLines={1} style={styles.textStyle}>{tripdata.pickup.add}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.addressStyle2}>
                                    <Text numberOfLines={1} style={styles.textStyle}>{tripdata.drop.add}</Text>
                                </TouchableOpacity>
                            </View>
                            : null}
                    </View>
                    <View style={[styles.menuIcon, isRTL ? { right: 15 } : { left: 15 }]}>
                        <TouchableOpacity onPress={onPressCancel} style={styles.menuIconButton} >
                            <Icon
                                name={isRTL ? 'arrow-right' : 'arrow-left'}
                                type='font-awesome'
                                color={colors.BLUE}
                                size={25}
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ height: auth && auth.profile && auth.profile.firstName && auth.profile.lastName &&  auth.profile.email  ? 200 : (auth.profile.firstName && auth.profile.lastName) ? 300 : auth.profile.email ? 300 : 350 }} showsVerticalScrollIndicator={false}>
                        {auth && auth.profile && !(auth.profile.firstName && auth.profile.lastName && auth.profile.email) ?
                            <View style={styles.vew}>
                                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Please fill the details</Text>
                                <View style={{ flexDirection: 'row', width: '100%' }}>
                                    {auth && auth.profile && !auth.profile.firstName ?
                                        <View style={{ width: '50%' }}>
                                            <Input
                                                editable={true}
                                                underlineColorAndroid={colors.TRANSPARENT}
                                                placeholder={t('first_name_placeholder')}
                                                placeholderTextColor={colors.DRIVER_TRIPS_TEXT}
                                                value={profileData.firstName}
                                                keyboardType={'email-address'}
                                                inputStyle={[styles.inputTextStyle, { textAlign: isRTL ? "right" : 'left', fontSize: 15 }]}
                                                onChangeText={(text) => { setProfileData({ ...profileData, firstName: text }) }}
                                                inputContainerStyle={[styles.inputContainerStyle]}
                                            />
                                        </View>
                                        : null}
                                    {auth && auth.profile && !auth.profile.lastName ?
                                        <View style={{ width: '50%' }}>
                                            <Input
                                                editable={true}
                                                underlineColorAndroid={colors.TRANSPARENT}
                                                placeholder={t('last_name_placeholder')}
                                                placeholderTextColor={colors.DRIVER_TRIPS_TEXT}
                                                value={profileData.lastName}
                                                keyboardType={'email-address'}
                                                inputStyle={[styles.inputTextStyle, { textAlign: isRTL ? "right" : 'left', fontSize: 15 }]}
                                                onChangeText={(text) => { setProfileData({ ...profileData, lastName: text }) }}
                                                inputContainerStyle={styles.inputContainerStyle}
                                            />
                                        </View>
                                        : null}
                                </View>
                                {auth && auth.profile && !auth.profile.email ?
                                    <Input
                                        editable={true}
                                        underlineColorAndroid={colors.TRANSPARENT}
                                        placeholder={t('email_placeholder')}
                                        placeholderTextColor={colors.DRIVER_TRIPS_TEXT}
                                        value={profileData.email}
                                        keyboardType={'email-address'}
                                        inputStyle={[styles.inputTextStyle, { textAlign: isRTL ? "right" : 'left', fontSize: 15 }]}
                                        onChangeText={(text) => { setProfileData({ ...profileData, email: text }) }}
                                        inputContainerStyle={styles.inputContainerStyle}
                                        autoCapitalize='none'
                                    />
                                    : null}

                            </View>
                            : null}
                        <View style={[auth && auth.profile && !(auth.profile.firstName && auth.profile.lastName && auth.profile.email) ? styles.bottomContainer : styles.bottomContainer1]}>
                            <View style={styles.offerContainer}>
                                <TouchableOpacity >
                                    <Text style={styles.offerText}> {t('estimate_fare_text')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.priceDetailsContainer}>
                                <View style={styles.priceDetailsLeft}>
                                    <View style={styles.priceDetails}>
                                        <View style={styles.totalFareContainer}>
                                            <Text style={styles.totalFareText}>{t('total_fare')}</Text>
                                        </View>
                                        <Icon
                                            name='info'
                                            color={colors.WHITE}
                                            type='simple-line-icon'
                                            size={15}
                                            containerStyle={styles.infoIcon}
                                        />
                                    </View>

                                    <View style={styles.iconContainer}>
                                        {settings.swipe_symbol === false ?
                                            <Text style={styles.priceText}> {settings ? settings.symbol : null} {estimate ? estimate.estimateFare : null}</Text>
                                            :
                                            <Text style={styles.priceText}> {estimate ? estimate.estimateFare : null} {settings ? settings.symbol : null}</Text>
                                        }
                                    </View>

                                </View>
                                <View style={styles.priceDetailsMiddle}>
                                    <View style={styles.triangle} />
                                    <View style={styles.lineHorizontal} />
                                </View>
                                <View style={styles.priceDetailsLeft}>
                                    <View style={styles.priceDetails}>
                                        <View style={styles.totalFareContainer}>
                                            <Text style={styles.totalFareText}>{estimate && estimate.estimateDistance ? parseFloat(estimate.estimateDistance).toFixed(settings.decimal) : 0} {settings && settings.convert_to_mile ? t('mile') : t('km')} </Text>
                                        </View>
                                        <Icon
                                            name='info'
                                            color={colors.WHITE}
                                            type='simple-line-icon'
                                            size={15}
                                            containerStyle={styles.infoIcon}
                                        />
                                    </View>
                                    <View style={styles.iconContainer}>
                                        <Text style={styles.priceText}>{estimate ? parseFloat(estimate.estimateTime / 60).toFixed(0) : 0} {t('mins')}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{
                                borderStyle: 'solid',
                                borderWidth: 0.3,
                                borderRadius: 1,
                                width: '90%',
                            }}>
                            </View>
                            <View style={{ width: width, justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
                                <Text style={[styles.offerText, { paddingTop: 2, paddingBottom: 5 }]}>{t('payment_mode')}</Text>
                            </View>
                            <View style={{ width: width, paddingBottom: 5, justifyContent: 'center', alignItems: 'center', borderBottomColor: colors.BOX_BG, }}>
                                <RadioForm
                                    radio_props={radioProps}
                                    initial={payment_mode}
                                    animation={false}
                                    formHorizontal={true}
                                    labelHorizontal={true}
                                    buttonColor={colors.RADIO_BUTTON}
                                    labelColor={colors.RADIO_BUTTON}
                                    labelStyle={isRTL ? { marginRight: 10, } : { marginRight: 10 }}
                                    selectedButtonColor={colors.BLUE}
                                    selectedLabelColor={colors.HEADER}
                                    onPress={(value) => {
                                        setPaymentMode(value);
                                    }}
                                />
                            </View>
                            <View style={styles.flexView}>
                                <Button
                                    title={t('confirm')}
                                    loading={bookModelLoading}
                                    loadingProps={{ size: "large", color: colors.BLUE }}
                                    titleStyle={{ color: colors.WHITE, fontWeight: 'bold' }}
                                    onPress={bookNow}
                                    buttonStyle={{ height: '100%', backgroundColor: colors.BLUE, borderRadius: 25, }}
                                    containerStyle={styles.buttonStyle}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.WHITE
    },
    vew: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        backgroundColor: colors.WHITE,
        padding: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity:Platform.OS == 'ios'? 0.1: 0.8,
        shadowRadius: 3,
        elevation:Platform.OS == 'ios'? 2: 8,
        marginTop: 5
    },
    square: {
        height: 14,
        width: 14,
        backgroundColor: colors.FOOTERTOP
    },
    iconContainer: { flex: 1 },
    mapcontainer: {
        flex: 7,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    bottomContainer: { alignItems: 'center', overflow: 'hidden', backgroundColor: colors.WHITE },
    bottomContainer1: {
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: colors.WHITE,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        shadowColor: 'black',
        shadowOffset: { width: -12, height: -18 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 8
    },
    offerContainer: { height: 30, backgroundColor: colors.BLUE, width: width, justifyContent: 'center', borderBottomColor: colors.BOX_BG, borderBottomWidth: Platform.OS == 'ios' ? 1 : 0 },
    offerText: { alignSelf: 'center', color: colors.WHITE, fontSize: 12, fontFamily: 'Roboto-Regular' },
    priceDetailsContainer: { backgroundColor: colors.WHITE, flexDirection: 'row', position: 'relative', zIndex: 1, },
    priceDetailsLeft: { flex: 19, height: 90 },
    priceDetailsMiddle: { flex: 2, height: 50, width: 1, alignItems: 'center' },
    priceDetails: { flex: 1, flexDirection: 'row' },
    totalFareContainer: { flex: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', },
    totalFareText: { color: colors.MAP_TEXT, fontFamily: 'Roboto-Bold', fontSize: 15, marginLeft: 40 },
    infoIcon: { flex: 2, alignItems: 'center', justifyContent: 'center' },
    priceText: { alignSelf: 'center', color: colors.BUTTON, fontFamily: 'Roboto-Bold', fontSize: 20 },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: colors.TRANSPARENT,
        borderStyle: 'solid',
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderBottomWidth: 10,
        borderLeftColor: colors.TRANSPARENT,
        borderRightColor: colors.TRANSPARENT,
        borderBottomColor: colors.BLUE,
        transform: [
            { rotate: '180deg' }
        ],
        marginTop: -1,
        overflow: 'visible'
    },
    lineHorizontal: { height: height / 18, width: 1, backgroundColor: colors.BLACK, alignItems: 'center', marginTop: 10 },
    buttonStyle: {
        height: '100%',
        width: '80%',
        alignSelf: 'center',
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3
    },
    flexView: {
        height: 50,
        width: '100%',
        marginVertical: 10,
    },
    addressStyle2: {
        height: 48,
        width: width - 84,
        justifyContent: 'center',
    },
    addressStyle1: {
        borderBottomColor: colors.BLACK,
        borderBottomWidth: 1,
        height: 48,
        width: width - 84,
        justifyContent: 'center',
        paddingTop: 2
    },
    textStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        color: '#000'
    },
    addressBar: {
        position: 'absolute',
        marginHorizontal: 20,
        top: Platform.OS == 'android' ? (__DEV__ ? 60 : 100) : (hasNotch ? 100 : 80),
        height: 100,
        width: width - 40,
        flexDirection: 'row',
        backgroundColor: colors.WHITE,
        paddingLeft: 10,
        paddingRight: 10,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        borderRadius: 8,
        elevation: 3
    },
    ballandsquare: {
        width: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    hbox1: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: colors.GREEN_DOT
    },
    hbox2: {
        height: 36,
        width: 1,
        backgroundColor: colors.MAP_TEXT
    },
    hbox3: {
        height: 12,
        width: 12,
        backgroundColor: colors.DULL_RED
    },
    contentStyle: {
        justifyContent: 'center',
        width: width - 74,
        height: 100
    },
    inputContainerStyle: {
        marginBottom: -15,
    },
    menuIcon: {
        height: 40,
        width: 40,
        borderRadius: 25,
        backgroundColor: colors.WHITE,
        shadowColor: 'black',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center', marginTop: -80, marginBottom: 5
    },
    menuIconButton: {
        flex: 1,
        height: 50,
        width: 50,
        justifyContent: 'center',
    },
});
