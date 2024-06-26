import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    Share,
    TextInput,
    KeyboardAvoidingView
} from 'react-native';
import { Icon, Input } from 'react-native-elements'
import ActionSheet from "react-native-actions-sheet";
import { colors } from '../common/theme';
import * as ImagePicker from 'expo-image-picker';
import i18n from 'i18n-js';
var { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { api, FirebaseContext } from 'common';
import StarRating from 'react-native-star-rating-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from '../components/RNPickerSelect';
import moment from 'moment/min/moment-with-locales';
import {MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons, Feather} from '@expo/vector-icons';
import { MAIN_COLOR } from '../common/sharedFunctions';
import Dialog from "react-native-dialog";
import { FontAwesome5 } from '@expo/vector-icons';
import rnauth from '@react-native-firebase/auth';

export default function ProfileScreen(props) {
    const { authRef, mobileAuthCredential, updatePhoneNumber } = useContext(FirebaseContext);
    const { t } = i18n;
    const [isRTL, setIsRTL] = useState();
    const {
        updateProfileImage,
        deleteUser,
        updateProfile,
        updateProfileWithEmail,
        checkUserExists
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const [profileData, setProfileData] = useState(null);
    const [loader, setLoader] = useState(false);
    const actionSheetRef = useRef(null);
    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);
    const pickerRef1 = React.createRef();

    const fromPage  = props.route.params && props.route.params.fromPage ? props.route.params.fromPage: null;


    useEffect(() => {
        setLangSelection(i18n.locale);
        setIsRTL(i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0);
    }, []);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData(auth.profile);
        }
    }, [auth.profile]);

    const showActionSheet = () => {
        actionSheetRef.current?.setModalVisible(true);
    }

    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderColor: colors.BORDER_TEXT, borderBottomWidth: 1, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('CAMERA', ImagePicker.launchCameraAsync) }}
                >
                    <Text style={{ color: colors.CAMERA_TEXT, fontWeight: 'bold' }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderBottomWidth: 1, borderColor: colors.BORDER_TEXT, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync) }}
                >
                    <Text style={{ color: colors.CAMERA_TEXT, fontWeight: 'bold' }}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, height: 50, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { actionSheetRef.current?.setModalVisible(false); }}>
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>{t('cancel')}</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    const _pickImage = async (permissionType, res) => {
        var pickFrom = res;
        let permisions;
        if (permissionType == 'CAMERA') {
            permisions = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        const { status } = permisions;

        if (status == 'granted') {
            setLoader(true);
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3]
            });
            actionSheetRef.current?.setModalVisible(false);
            if (!result.canceled) {
                setProfileData({
                    ...profileData,
                    profile_image: result.assets[0].uri
                })
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setLoader(false);
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET',  result.assets[0].uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    updateProfileImage(blob);
                }
                setLoader(false);
            }
            else {
                setLoader(false);
            }
        } else {
            Alert.alert(t('alert'), t('camera_permission_error'))
        }
    };

    const deleteAccount = () => {
        setDLoading(true)
        Alert.alert(
            t('delete_account_modal_title'),
            t('delete_account_modal_subtitle'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { setDLoading(false)},
                    style: 'cancel',
                    
                },
                {
                    text: t('yes'), onPress: () => {
                        dispatch(deleteUser(auth.profile.uid)); 

                    }
                },
            ],
            { cancelable: false },
        );
    }

    const [otp, setOtp] = useState("");
    const [editName, setEditName] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [editMobile, setEditMobile] = useState(false);
    const [confirmCode, setConfirmCode] = useState(null);
    
    const [updateCalled,setUpdateCalled] = useState(false);
    const [otpCalled, setOtpCalled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dloading, setDLoading] = useState(false);

    useEffect(() => {
        if (auth.profile && auth.profile.uid) {
            setProfileData({ ...auth.profile });
            if(updateCalled){
                Alert.alert(
                    t('alert'),
                    t('profile_updated'),
                    [
                        { text: t('ok'), onPress: () => {
                            setUpdateCalled(false);
                        }}
                    ],
                    { cancelable: true }
                );
                setUpdateCalled(false);
            }
        }
    }, [auth.profile, updateCalled]);

    const saveName = async () => {
        if(profileData.firstName.length > 0 &&profileData.lastName.length > 0 ){
            let userData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName
            }
            setUpdateCalled(true);
            dispatch(updateProfile(userData)); 
            setEditName(false);
        }else{
            setEditName(true)
            Alert.alert(
                t('alert'),
                t('proper_input_name'),
                [
                    {
                        text: t('cancel'),
                        onPress: () => { setEditName(false)},
                        style: 'cancel',
                        
                    },
                    { text: t('ok'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        }
    }

    const validateEmail = (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        const emailValid = re.test(email)
        return emailValid;
    }

    const completeSubmit = () => {
        setLoading(true);
        let userData = {
            mobile: profileData.mobile,
            email: profileData.email
        }
        setUpdateCalled(true);
        dispatch(updateProfile(userData));
        setLoading(false);
        setEditMobile(false);
    }

    const saveProfile = async (set) => {
        setLoading(true)
        if (profileData.email === auth.profile.email && set === 1 ) {
            setEditEmail(false);
        } else if (profileData.mobile === auth.profile.mobile && set === 2){
            setEditMobile(false);
            setLoading(false)
        } else if (profileData.email !== auth.profile.email) {
            if (validateEmail(profileData.email)) {
                checkUserExists({email: profileData.email}).then((res) => {
                    if (res.users && res.users.length > 0) {
                        Alert.alert(t('alert'), t('user_exists'));
                        setLoading(false)
                    }
                    else if(res.error){
                        Alert.alert(t('alert'), t('email_or_mobile_issue'));
                        setLoading(false)
                    } else{
                        setEditEmail(false);
                        profileData['uid'] = auth.profile.uid;
                        dispatch(updateProfileWithEmail(profileData));
                        setUpdateCalled(true);
                        setLoading(false)
                    }
                });
            } else {
                Alert.alert(t('alert'), t('proper_email'));
                setLoading(false);
            }
        } else{
            if (profileData.mobile !== auth.profile.mobile &&  profileData.mobile && profileData.mobile.length > 6) {
                checkUserExists({mobile:profileData.mobile}).then(async(res) => {
                    if (res.users && res.users.length > 0) {
                        Alert.alert(t('alert'), t('user_exists'));
                        setLoading(false);
                        setEditMobile(false);
                    }
                    else if(res.error){
                        Alert.alert(t('alert'), t('email_or_mobile_issue'));
                        setLoading(false);
                        setEditMobile(false);
                    } else{
                        const snapshot = await rnauth()
                       .verifyPhoneNumber(profileData.mobile)
                       .on('state_changed', (phoneAuthSnapshot) => {
                            if(phoneAuthSnapshot){
                                console.log(phoneAuthSnapshot.state);
                            }
                        });
                        if(snapshot){
                            setConfirmCode(snapshot);
                            setOtpCalled(true);
                        }
                    }
                });
            } else {
                Alert.alert(t('alert'), t('mobile_no_blank_error'))
                setLoading(false)
                setEditMobile(false);
            }
        } 
    }

    const handleVerify = async () => {
        setOtpCalled(false);
        if (otp && otp.length === 6 && !isNaN(otp)) {
            const credential = await mobileAuthCredential(
                confirmCode.verificationId,
                otp
            );
            updatePhoneNumber(authRef().currentUser, credential).then((res)=>{
                completeSubmit();
            }).catch((error)=>{
                setOtp('');
                setOtpCalled(true);
                Alert.alert(t('alert'), t('otp_validate_error'));
            });
        } else {
            setOtp('');
            setOtpCalled(true);
            Alert.alert(t('alert'), t('otp_validate_error'));
        }
    }

    const handleClose = () => {
        setOtpCalled(false);
        setLoading(false);
    }

    const onPressBack = () => {
        if(fromPage == 'DriverTrips' || fromPage == 'Map' || fromPage == 'Wallet'){
            props.navigation.navigate('TabRoot', { screen: fromPage });
        }else{
            props.navigation.goBack() 
        }
    }

    const lCom = () => {
        return (
          <TouchableOpacity style={{ marginLeft: 10}} onPress={onPressBack}>
            <FontAwesome5 name="arrow-left" size={24} color={colors.WHITE} />
          </TouchableOpacity>
        );
    }
    
    React.useEffect(() => {
        props.navigation.setOptions({
            headerLeft: lCom,
        });
    }, [props.navigation]);


    return (
        <View style={styles.mainView}>

            <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : (__DEV__ ? null : "padding" )}>
            <View style={{ backgroundColor: MAIN_COLOR }}>
                <View style={styles.vew1}>
                    <View style={styles.imageViewStyle} >
                        {loader ?
                            <View style={[styles.loadingcontainer, styles.horizontal]}>
                                <ActivityIndicator size="large" color={colors.INDICATOR_BLUE} />
                            </View>
                            : (
                                <View
                                  style={{
                                    borderRadius: 120 / 2,
                                    width: 120,
                                    height: 120,
                                    backgroundColor: colors.LIGHT_GREY,
                                    elevation: 10,
                                  }}
                                >
                                  {profileData && profileData.profile_image ? (
                                    <Image
                                      source={{ uri: profileData.profile_image }}
                                      style={{
                                        borderRadius: 110 / 2,
                                        width: 110,
                                        height: 110,
                                        position: "absolute",
                                        top: 5,
                                        left: 5,
                                      }}
                                    />
                                  ) : (
                                    <Icon
                                      name="user"
                                      type="font-awesome"
                                      size={100}
                                      color={colors.BLUE}
                                      style={{ marginTop: 5,marginTop:20,marginLeft:-10,marginRight:10,marginBottom:20  }}
                                    />
                                  )}
                                  <TouchableOpacity
                                    style={{
                                      position: "absolute",
                                      bottom: 0,
                                      right: 0,
                                      backgroundColor: colors.GREY,
                                      borderRadius: 40 / 2,
                                      width: 40,
                                      height: 40,
                                      elevation: 10,
                                      borderWidth: 1,
                                      borderColor: "#DFDFE9",
                                      justifyContent: "center",
                                    }}
                                    onPress={showActionSheet}
                                  >
                                    <Icon
                                      name="camera-sharp"
                                      type="ionicon"
                                      color={colors.BLUE}
                                      size={20}
                                    />
                                  </TouchableOpacity>
                                </View>
                              )
                        }

                    </View>
                    <View style={{flexDirection:isRTL?'row-reverse':'row', marginHorizontal: 20, paddingRight: 15}}>
                        {editName ?
                        <View style={[isRTL?{flexDirection:'row-reverse', width: '100%'}:{flexDirection:'row',marginLeft:0, width: '100%', height: 50}]}>
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('first_name_placeholder')}
                                placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
                                value={profileData && profileData.firstName ? profileData.firstName : ""}
                                keyboardType={'email-address'}
                                inputStyle={[styles.inputTextStyle, isRTL ? { textAlign: 'right', fontSize: 13, } : { textAlign: 'left', fontSize: 13}]}
                                onChangeText={(text) => { setProfileData({ ...profileData, firstName: text }) }}
                                secureTextEntry={false}
                                errorStyle={styles.errorMessageStyle}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={{width: "50%"}}
                            />

                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('last_name_placeholder')}
                                placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
                                value={profileData && profileData.lastName ? profileData.lastName : ""}
                                keyboardType={'email-address'}
                                inputStyle={[styles.inputTextStyle, isRTL ? {textAlign: 'right', fontSize: 13} : {textAlign: 'left', fontSize: 13}]}
                                onChangeText={(text) => { setProfileData({ ...profileData, lastName: text }) }}
                                secureTextEntry={false}
                                errorStyle={styles.errorMessageStyle}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={isRTL ? {marginLeft: 0,width: "50%"} : {marginRight: 0,width: "50%"}}
                            />
                        </View>
                        :
                            <View style={{width: '100%'}}>
                            {isRTL?
                                <Text numberOfLines={1} style={[styles.textPropStyle,[isRTL?{marginRight:35}:{marginLeft:40}]]} >{auth.profile && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.lastName.toUpperCase()  + " " + auth.profile.firstName.toUpperCase() : t('no_name')}</Text>
                            :
                                <Text numberOfLines={1} style={[styles.textPropStyle,[isRTL?{marginRight:35}:{marginLeft:40}]]} >{auth.profile  && (auth.profile.firstName && auth.profile.lastName) ? auth.profile.firstName.toUpperCase() + " " + auth.profile.lastName.toUpperCase() : t('no_name')}</Text>
                            }
                               
                            </View>
                        }
                        {editName ?
                            <TouchableOpacity onPress={saveName}>
                                <MaterialIcons name="check" size={24} color={colors.SKY} style={{marginTop:15}} />
                            </TouchableOpacity>
                        :
                            <TouchableOpacity onPress={() => setEditName(true)}>
                                <Feather name="edit-3" size={22} color={colors.BLUE} style={{marginTop:10}} />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollStyle}>
                {
                    uploadImage()
                }
                <View style={styles.newViewStyle}>

                    <View style={[styles.myViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', height: editEmail ? 74 : 54 }]}>
                        <View style={styles.iconViewStyle}>
                            <Entypo name="email" size={25} color={colors.BLUE} />
                        </View>
                        <View style={[styles.flexView1, [isRTL ? { marginRight: 15, width: width - 70 } : { width: width - 70}]]}>
                            <Text style={[styles.text1,isRTL? {textAlign: 'right'} : {textAlign: 'left'}]}>{t('email_placeholder')}</Text>
                            <View style={{flexDirection:isRTL?'row-reverse':'row', justifyContent: 'space-between', paddingRight: 15}}>
                                {editEmail ?
                                <View style={{width:width - 140}}>
                                    <TextInput
                                        style={[styles.text2,{borderBottomColor: colors.BUTTON, borderBottomWidth: 1, height: editEmail ? 40 : null}]}
                                        placeholder={t('email_placeholder')}
                                        placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
                                        value={profileData && profileData.email ? profileData.email : ''}
                                        keyboardType={'email-address'}
                                        onChangeText={(text) => { setProfileData({ ...profileData, email: text }) }}
                                        secureTextEntry={false}
                                        blurOnSubmit={true}
                                        errorStyle={styles.errorMessageStyle}
                                        inputContainerStyle={[styles.inputContainerStyle, {height: 50}]}
                                        autoCapitalize='none'
                                    />    
                                    </View>               
                                :
                                    <View style={{marginTop: 5, width:width - 140}}>
                                        <Text style={[styles.text2,isRTL? {textAlign: 'right'} : {textAlign: 'left'}]} numberOfLines={1}>{profileData &&  profileData.email ? profileData.email : t('email_placeholder')}</Text>
                                    </View>
                                }

                                {editEmail ?
                                    <TouchableOpacity onPress={() => saveProfile(1)} style={[isRTL?{marginRight:20}:{marginLeft:20}]}>
                                         {loading ?
                                            <ActivityIndicator color={colors.BLUE} size='small'/>
                                        :
                                            <MaterialIcons name="check" size={24} color={colors.BLUE} />
                                        }
                                    </TouchableOpacity>
                                :
                                    <TouchableOpacity onPress={() => setEditEmail(true)} style={[isRTL?{marginRight:20}:{marginLeft:20}]}>
                                        <Feather name="edit-3" size={22} color={colors.BLUE} />
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </View>


                    <View style={[styles.myViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', height: editMobile ? 74 : 54  }]}>
                        <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Icon
                                name='phone-call'
                                type='feather'
                                size={25}
                                color={colors.BLUE}
                            />

                        </View>
                        <View style={[styles.flexView1, [isRTL ? { marginRight: 15, width: width - 70 } : { width: width - 70 }]]}>
                            <Text style={[styles.text1,isRTL? {textAlign: 'right'} : {textAlign: 'left'}]}>{t('mobile')}</Text>
                            <View style={{flexDirection:isRTL?'row-reverse':'row',justifyContent:'space-between', paddingRight: 15}}>
                            {editMobile ?
                                <View style={{width:width - 140}}>
                                <TextInput
                                        style={[styles.text2,{borderBottomColor: colors.BUTTON, borderBottomWidth: 1, height: editMobile ? 40 : null}]}
                                        placeholder={t('mobile')}
                                        placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
                                        value={profileData && profileData.mobile ? profileData.mobile : ''}
                                        keyboardType={'phone-pad'}
                                        onChangeText={(text) => {
                                            setProfileData({ ...profileData, mobile: text })
                                        }}
                                        secureTextEntry={false}
                                        errorStyle={styles.errorMessageStyle}
                                        inputContainerStyle={[styles.inputContainerStyle, {height: 50}]}
                                    />
                                </View>
                            :
                                <View style={{width:width - 140, marginTop: 5}}>
                                    <Text style={[styles.text2,isRTL? {textAlign: 'right'} : {textAlign: 'left'}]} >{profileData && profileData.mobile ? profileData.mobile : t('mobile')}</Text>
                                </View>
                            }
                            {editMobile ?
                                <TouchableOpacity onPress={() => saveProfile(2)} style={[isRTL?{marginRight:20}:{marginLeft:20}]}>
                                   {loading ?
                                            <ActivityIndicator color={colors.BLUE} size='small'/>
                                        :
                                            <MaterialIcons name="check" size={24} color={colors.BLUE} />
                                        }
                                </TouchableOpacity>
                            :
                                <TouchableOpacity onPress={() => setEditMobile(true)} style={[isRTL?{marginRight:20}:{marginLeft:20}]}>
                                    <Feather name="edit-3" size={22} color={colors.BLUE} />
                                </TouchableOpacity>
                            }
                             </View>
                        </View>
                    </View>

                    {languagedata && languagedata.langlist ?
                        <View style={[styles.myViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={styles.iconViewStyle}>

                                <Ionicons name="language-sharp" size={25} color={colors.BLUE} />
                            </View>
                            <View style={[styles.flexView1, { alignSelf: isRTL ? 'flex-end' : 'flex-start', }]}>
                                <Text style={[styles.text1, [isRTL ? { marginRight: 15 } : null]]}>{t('lang')}</Text>
                                {langSelection ?
                                    <RNPickerSelect
                                        pickerRef={pickerRef1}
                                        placeholder={{}}
                                        value={langSelection}
                                        useNativeAndroidPickerStyle={false}
                                        style={{
                                            inputIOS: [styles.pickerStyle, [isRTL ? { marginRight: 0 } : { marginLeft: 15 }]],
                                            inputAndroid: [styles.pickerStyle1, [isRTL ? { marginRight: 0 , textAlign: 'right'} : { marginLeft: 10, textAlign: 'left' }]],
                                            placeholder: {
                                                color: colors.PROFILE_PLACEHOLDER_CONTENT
                                            }
                                        }}
                                        onTap={()=>{pickerRef1.current.focus()}}
                                        onValueChange={
                                            (text) => {
                                                let defl = null;
                                                for (const value of Object.values(languagedata.langlist)) {
                                                    if (value.langLocale == text) {
                                                        defl = value;
                                                    }
                                                }
                                                setLangSelection(text);
                                                i18n.locale = text;
                                                moment.locale(defl.dateLocale);
                                                setIsRTL(text == 'he' || text == 'ar')
                                                AsyncStorage.setItem('lang', JSON.stringify({ langLocale: text, dateLocale: defl.dateLocale }));
                                                dispatch(updateProfile({ lang: { langLocale: text, dateLocale: defl.dateLocale } }));
                                            }
                                        }
                                        label={"Language"}
                                        items={Object.values(languagedata.langlist).map(function (value) { return { label: value.langName, value: value.langLocale }; })}
                                        Icon={() => {return <Ionicons name="arrow-down" size={20} color={colors.BLUE} style={[isRTL?{marginLeft: Platform.OS == "ios" ? -80 : -60, marginTop: 5}:{marginRight: Platform.OS == "ios" ? -20 : 0, marginTop: 5}]}/>;}}
                                    />
                                : null}
                            </View>
                        </View>
                        : null}
                    {profileData && profileData.referralId ?
                        <View style={[styles.myViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <Icon
                                    name='award'
                                    type='feather'
                                    color={colors.BLUE}
                                    size={25}
                                />
                            </View>
                            <View style={[styles.flexView1, [isRTL ? { marginRight: 15 } : null]]}>
                                <Text style={styles.text1}>{t('referralId')}</Text>
                                <Text style={[styles.text2,isRTL? {textAlign: 'right'} : {textAlign: 'left'}]} >{profileData.referralId}</Text>
                            </View>
                            <TouchableOpacity
                                style={[isRTL ? { marginRight: 10, marginTop: 15 } : { marginLeft: 10, marginTop: 15 }]}
                                onPress={() => {
                                    settings.bonus > 0 ?
                                        Share.share({
                                            message: t('share_msg') + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.profile.referralId + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                        })
                                        :
                                        Share.share({
                                            message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                        })
                                }}
                            >
                                <Icon
                                    name={Platform.OS == 'android' ? 'share-social' : 'share'}
                                    type='ionicon'
                                    color={colors.BLUE}
                                />
                            </TouchableOpacity>
                        </View>
                        : null}
                    {profileData && profileData.usertype == 'driver' ?
                        <View style={[styles.myViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <Ionicons name="md-car-sport-outline" size={25} color={colors.BLUE} />
                            </View>
                            <View style={[styles.flexView1, [isRTL ? { marginRight: 15 } : null]]}>
                                <Text style={styles.text1}>{t('car_type')}</Text>
                                <Text style={styles.text2}>{profileData.carType}</Text>
                            </View>
                        </View>
                        : null}
                    {profileData && profileData.usertype == 'driver' ?
                        <View style={[styles.myViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <MaterialCommunityIcons name="star-shooting-outline" size={25} color={colors.BLUE} />
                            </View>
                            <View style={[styles.flexView1, [isRTL ? { marginRight: 15 } : null]]}>
                                <Text style={styles.text1}>{t('you_rated_text')}</Text>
                                <View style={[{ flex: 1 }, isRTL ? { alignSelf: 'flex-end', flexDirection: 'row-reverse' } : { alignSelf: 'flex-start', flexDirection: 'row' }]}>
                                    <Text style={[styles.text2, isRTL ? { color: colors.ProfileDetails_Primary } : { left: 10, color: colors.ProfileDetails_Primary }]}>{profileData && profileData.usertype && profileData.rating ? profileData.rating : 0}</Text>
                                    <StarRating
                                        maxStars={5}
                                        starSize={15}
                                        enableHalfStar={true}
                                        color={colors.STAR}
                                        emptyColor={colors.STAR}
                                        rating={profileData && profileData.usertype && profileData.rating ? parseFloat(profileData.rating) : 0}
                                        style={[styles.contStyle, isRTL ? { marginRight: 10 } : { marginLeft: 10 }]}
                                        onChange={()=>{
                                            //console.log('hello')
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                        : null}
                </View>

                <TouchableOpacity onPress={deleteAccount} style={styles.vew2}>
                     {dloading ?
                            <ActivityIndicator color={colors.WHITE} size='small'/>
                        :
                            <Text style={[styles.emailStyle, { color: colors.WHITE }]}>{t('delete_account_lebel')}</Text>
                     }
                </TouchableOpacity>
                <Dialog.Container visible={otpCalled}>
                    <Dialog.Description style={{color:colors.HEADER,fontWeight:'bold'}}>{auth.profile && profileData && (auth.profile.mobile != profileData.mobile) ? t('check_mobile') : t('check_email')}</Dialog.Description>
                    <Dialog.Input  placeholder= {t('otp_here')} placeholderTextColor ={colors.HEADER} keyboardType = 'numeric' onChangeText={(otp) => setOtp(otp)} style={{color:colors.HEADER,textAlign:isRTL?'right':'left'}}></Dialog.Input>
                    <Dialog.Button label={t('cancel')} onPress={handleClose} style={{marginRight:15,color:colors.HEADER}}/>
                    <Dialog.Button label={t('ok')} onPress={handleVerify} style={{marginRight:10,color:colors.SKY}}/>
                </Dialog.Container>
            </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerTitleStyle: {
        color: colors.HEADER,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    logo: {
        flex: 1,
        position: 'absolute',
        top: 110,
        width: '100%',
        justifyContent: "flex-end",
        alignItems: 'center'
    },
    footer: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        height: 150,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    vew2: {
        flexDirection: 'row',
        height: 40, 
        width: 140,
        alignItems: 'center', 
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: colors.LIGHT_RED,
        borderRadius: 10,
        marginVertical:15
    },
    scrollStyle: {
        height: height,
        backgroundColor: colors.WHITE
    },
    scrollViewStyle: {
        width: width,
        height: 50,
        marginVertical: 10,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold'
    },
    bonusAmount: {
        right: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
    viewStyle: {
        alignItems: 'center',
        height: '15%'
    },
    vew1: {
        backgroundColor: colors.WHITE,
        width: '100%',
        marginTop: 50,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        alignItems:'center'
    },
    imageViewStyle: {
        backgroundColor: colors.WHITE,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
        width: 100,
        height: 100,
        alignSelf: 'center',
        borderRadius: 100 / 2,
        marginTop: -45,
        overflow: 'hidden',
        justifyContent: 'center'
    },
    textPropStyle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: colors.BUTTON,
        fontFamily: 'Roboto-Bold',
        textTransform: 'uppercase',
        textAlign:'center',
        marginTop:10
    },
    newViewStyle: {
        flex: 1,
        marginTop: 10,
        marginHorizontal: 10
    },
    myViewStyle: {
        flex: 1,
        borderBottomColor: colors.BORDER_TEXT,
        backgroundColor: colors.WHITE,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
        marginBottom: 10,
        height: 54,
        borderRadius: 15,
        width:'100%'
    },
    iconViewStyle: {
        alignSelf: 'center',
        padding: 10,
        width: 50
    },
    emailStyle: {
        fontSize: 17,
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold',
        textAlign: 'center'
    },
    emailAdressStyle: {
        fontSize: 15,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Regular'
    },
    mainIconView: {
        flex: 1,
        left: 20,
        marginRight: 40,
        borderBottomColor: colors.BUTTON,
        borderBottomWidth: 1
    },
    text1: {
        fontSize: 17,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold'
    },
    text2: {
        fontSize: 15,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Regular'
    },
    textIconStyle: {
        width: width,
        height: 50,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textIconStyle2: {
        width: width,
        height: 50,
        marginTop: 10,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
    },
    flexView1: {
        padding: 3,
    },

    flexView3: {
        marginTop: 10,
        marginBottom: 10
    },
    loadingcontainer: {
        flex: 1,
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    contStyle: {
        width: 90,
    },
    pickerStyle: {
        color: colors.HEADER,
        width: 60,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold'

    },
    pickerStyle1: {
        color: colors.HEADER,
        width: 68,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold'
    },
    vew: {
        width: '40%',
        height: 65
    },
    errorMessageStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 0
    },
    containerStyle: {
        flexDirection: 'column',
      
    },   
    inputContainerStyle: {
        width: "100%",
    },
    inputTextStyle: {
        color: colors.HEADER,
        fontSize: 13,
        height: 32,
    }
});
