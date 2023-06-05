/** @format */

import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
  Linking,
  Keyboard,
  SafeAreaView,
} from "react-native";
import { Icon } from "react-native-elements";
import MaterialButtonDark from "../components/MaterialButtonDark";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { api } from "common";
import { colors } from "../common/theme";
import RNPickerSelect from "../components/RNPickerSelect";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import i18n from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import moment from "moment/min/moment-with-locales";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";
import rnauth from "@react-native-firebase/auth";
import PhoneInput from "./lib/index";
var { width } = Dimensions.get("window");
const sm_width = width * 2;
const md_width = width * 2.625;
const yr = new Date();
const now = yr.getFullYear();
export default function LoginScreen(props) {
  const {
    clearLoginError,
    requestPhoneOtpDevice,
    mobileSignIn,
    countries,
    facebookSignIn,
    appleSignIn,
    verifyEmailOtp,
    verifyEmailPassword,
    sendResetMail,
    checkUserExists,
  } = api;
  const auth = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settingsdata.settings);
  const dispatch = useDispatch();

  const formatCountries = () => {
    let arr = [];
    for (let i = 0; i < countries.length; i++) {
      let txt = countries[i].label + " (+" + countries[i].phone + ")";
      arr.push({ label: txt, value: txt, key: txt });
    }
    return arr;
  };

  const [state, setState] = useState({
    entryType: null,
    contact: null,
    verificationId: null,
    verificationCode: null,
    countryCodeList: formatCountries(),
    countryCode: null,
  });

  const pageActive = useRef(false);
  const [loading, setLoading] = useState(false);
  const [newUserText, setNewUserText] = useState(false);

  const { t } = i18n;
  const [isRTL, setIsRTL] = useState();
  const [langSelection, setLangSelection] = useState();
  let [loginType, setLoginType] = useState("mobile");
  const languagedata = useSelector((state) => state.languagedata);
  const [eyePass, setEyePass] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const pickerRef1 = React.createRef();
  const pickerRef2 = React.createRef();
  const [keyboardStatus, setKeyboardStatus] = useState("Keyboard Hidden");
  const phoneInput = useRef(null);
  const [value, setValue] = useState("");
  const [autoFocus, setAutoFocus] = useState(false);
  const [formattedValue, setFormattedValue] = useState("");
  useEffect(() => {
    AsyncStorage.getItem("lang", (err, result) => {
      if (result) {
        const langLocale = JSON.parse(result)["langLocale"];
        setIsRTL(langLocale == "he" || langLocale == "ar");
        setLangSelection(langLocale);
      } else {
        setIsRTL(
          i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0
        );
        setLangSelection(i18n.locale);
      }
    });
  }, []);

  useEffect(() => {
    if (settings) {
      for (let i = 0; i < countries.length; i++) {
        if (countries[i].label == settings.country) {
          setState({
            ...state,
            countryCode: settings.country + " (+" + countries[i].phone + ")",
          });
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    if (auth.profile && pageActive.current) {
      pageActive.current = false;
      setLoading(false);
      setNewUserText(false);
    }
    if (
      auth.error &&
      auth.error.msg &&
      pageActive.current &&
      auth.error.msg.message !== t("not_logged_in")
    ) {
      pageActive.current = false;
      setState({ ...state, verificationCode: "" });
      Alert.alert(t("alert"), t("login_error"));

      dispatch(clearLoginError());
      setLoading(false);
    }
    if (auth.verificationId) {
      pageActive.current = false;
      setState({ ...state, verificationId: auth.verificationId });
      setLoading(false);
    }
  }, [auth.profile, auth.error, auth.error.msg, auth.verificationId]);

  const onPressLogin = async () => {
    setLoading(true);
    if (state.countryCode && state.countryCode !== t("select_country")) {
      if (state.contact) {
        if (isNaN(state.contact)) {
          setState({ ...state, entryType: "email" });
          const re =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (re.test(state.contact)) {
            pageActive.current = true;
            dispatch(
              verifyEmailPassword(state.contact, state.verificationCode)
            );
          } else {
            Alert.alert(t("alert"), t("proper_email"));
            setLoading(false);
          }
        } else {
          setState({ ...state, entryType: "mobile" });
          let formattedNum = state.contact.replace(/ /g, "");
          formattedNum =
            state.countryCode.split("(")[1].split(")")[0] +
            formattedNum.replace(/-/g, "");
          if (formattedNum.length > 6) {
            checkUserExists({ mobile: formattedNum }).then(async (res) => {
              if (res.users && res.users.length > 0) {
                setIsNewUser(false);
                if (auth.verificationId) {
                  pageActive.current = false;
                  setState({ ...state, verificationId: auth.verificationId });
                  setLoading(false);
                }
                const confirmation = await rnauth().signInWithPhoneNumber(
                  formattedNum
                );

                if (confirmation && confirmation.verificationId) {
                  dispatch(requestPhoneOtpDevice(confirmation.verificationId));
                } else {
                  Alert.alert(t("alert"), t("auth_error"));
                  setLoading(false);
                }
              } else if (res.error) {
                Alert.alert(t("alert"), t("email_or_mobile_issue"));
                setLoading(false);
              } else {
                setIsNewUser(true);
                rnauth()
                  .verifyPhoneNumber(formattedNum)
                  .then((confirmation) => {
                    if (confirmation && confirmation.verificationId) {
                      dispatch(
                        requestPhoneOtpDevice(confirmation.verificationId)
                      );
                    } else {
                      Alert.alert(t("alert"), t("auth_error"));
                      setLoading(false);
                    }
                  })
                  .catch((error) => {
                    Alert.alert(t("alert"), t("auth_error"));
                    setLoading(false);
                  });
              }
            });
          } else {
            Alert.alert(t("alert"), t("mobile_no_blank_error"));
            setLoading(false);
          }
        }
      } else {
        Alert.alert(t("alert"), t("contact_input_error"));
        setLoading(false);
      }
    } else {
      Alert.alert(t("alert"), t("country_blank_error"));
      setLoading(false);
    }
  };

  const onSignIn = async () => {
    if (state.verificationCode) {
      setLoading(true);
      if (isNewUser) {
        setNewUserText(true);
      }
      pageActive.current = true;
      if (state.entryType == "email") {
        dispatch(verifyEmailOtp(state.contact, state.verificationCode));
      } else {
        dispatch(mobileSignIn(state.verificationId, state.verificationCode));
      }
    } else {
      setNewUserText(false);
      Alert.alert(t("alert"), t("otp_blank_error"));
      setLoading(false);
    }
  };

  const CancelLogin = () => {
    setNewUserText(false);
    setState({
      ...state,
      contact: null,
      verificationId: null,
      verificationCode: null,
    });
  };

  const FbLogin = async () => {
    try {
      LoginManager.logInWithPermissions(["public_profile"]).then(
        function (result) {
          if (result.isCancelled) {
            console.log("Login cancelled");
          } else {
            AccessToken.getCurrentAccessToken().then((data) => {
              pageActive.current = true;
              dispatch(facebookSignIn(data.accessToken.toString()));
            });
          }
        },
        function (error) {
          Alert.alert(t("alert"), t("facebook_login_auth_error"));
        }
      );
    } catch (error) {
      console.log(error);
      Alert.alert(t("alert"), t("facebook_login_auth_error"));
    }
  };

  const AppleLogin = async () => {
    const csrf = Math.random().toString(36).substring(2, 15);
    const nonce = Math.random().toString(36).substring(2, 10);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    );
    try {
      const applelogincredentials = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        state: csrf,
        nonce: hashedNonce,
      });

      pageActive.current = true;
      dispatch(
        appleSignIn({
          idToken: applelogincredentials.identityToken,
          rawNonce: nonce,
        })
      );
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        console.log(error);
      } else {
        Alert.alert(t("alert"), t("apple_signin_error"));
      }
    }
  };

  const onPhoneLogin = () => {
    setLoginType("mobile");
  };

  const onEmailLogin = () => {
    setLoginType("email");
  };

  const openRegister = () => {
    pageActive.current = false;
    props.navigation.navigate("Register");
  };

  const openTerms = async () => {
    Linking.openURL(settings.CompanyTerms).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  const forgotPassword = () => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(state.contact)) {
      Alert.alert(
        t("alert"),
        t("set_link_email"),
        [
          { text: t("cancel"), onPress: () => {}, style: "cancel" },
          {
            text: t("ok"),
            onPress: () => {
              pageActive.current = true;
              dispatch(sendResetMail(state.contact));
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert(t("alert"), t("proper_email"));
      setLoading(false);
    }
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus("Keyboard Shown");
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus("Keyboard Hidden");
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* <ImageBackground
        source={require("../../assets/images/bg.jpg")}
        resizeMode="stretch"
        style={[
          styles.imagebg,
          {
            marginTop:
              keyboardStatus == "Keyboard Shown" ? -(width * 0.55) : null,
          },
        ]}
      > */}
      <ScrollView
        style={styles.scrollViewStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}></View>
        <View
          style={[styles.headLanuage, [isRTL ? { left: 10 } : { right: 10 }]]}
        >
          <Text style={{ color: colors.BLACK, marginLeft: 3 }}>
            {t("lang1")}
          </Text>
          {langSelection && languagedata && languagedata.langlist ? (
            <RNPickerSelect
              pickerRef={pickerRef1}
              placeholder={{}}
              value={langSelection}
              useNativeAndroidPickerStyle={false}
              style={{
                inputIOS: styles.pickerStyle1,
                inputAndroid: styles.pickerStyle1,
                placeholder: {
                  color: "white",
                },
              }}
              onTap={() => {
                pickerRef1.current.focus();
              }}
              onValueChange={(text) => {
                let defl = null;
                for (const value of Object.values(languagedata.langlist)) {
                  if (value.langLocale == text) {
                    defl = value;
                  }
                }

                setLangSelection(text);
                i18n.locale = text;
                moment.locale(defl.dateLocale);
                setIsRTL(text == "he" || text == "ar");
                AsyncStorage.setItem(
                  "lang",
                  JSON.stringify({
                    langLocale: text,
                    dateLocale: defl.dateLocale,
                  })
                );
              }}
              label={"Language"}
              items={Object.values(languagedata.langlist).map(function (value) {
                return { label: value.langName, value: value.langLocale };
              })}
              Icon={() => {
                return (
                  <Ionicons
                    style={{ marginTop: 5 }}
                    name="md-arrow-down"
                    size={20}
                    color={colors.BLUE}
                  />
                );
              }}
            />
          ) : null}
        </View>
        {/* {!isNaN(state.contact) ? (
          <View style={[styles.box1]}>
            <RNPickerSelect
              pickerRef={pickerRef2}
              placeholder={{
                label: t("select_country"),
                value: t("select_country"),
              }}
              value={state.countryCode}
              useNativeAndroidPickerStyle={false}
              onTap={() => {
                Keyboard.dismiss();
                pickerRef2.current.focus();
              }}
              style={{
                inputIOS: [
                  styles.pickerStyle,
                  { textAlign: isRTL ? "right" : "left" },
                ],
                inputAndroid: [
                  styles.pickerStyle,
                  { textAlign: isRTL ? "right" : "left" },
                ],
              }}
              onValueChange={(value) =>
                setState({ ...state, countryCode: value })
              }
              items={state.countryCodeList}
              disabled={
                !!state.verificationId || !settings.AllowCountrySelection
                  ? true
                  : false
              }
            />
          </View>
        ) : null} */}

        <View
          style={{
            width: "90%",
            alignSelf: "center",
            flexDirection: "column",
            justifyContent: "space-between",
            marginTop: "-85%",
          }}
        >
          {loginType == "mobile" ? (
            <View style={{ marginBottom: 10 }}>
              <Text
                style={{
                  fontSize: 20,
                  marginBottom: 10,
                  fontFamily: "Uber Move",
                  fontWeight: "bold",
                }}
              >
                {"Enter your mobile number"}
              </Text>
              <SafeAreaView>
                <PhoneInput
                  ref={phoneInput}
                  defaultValue={value}
                  textInputStyle={{ fontSize: 20 }}
                  textContainerStyle={{
                    borderColor: autoFocus ? colors.BLUE : colors.LIGHT_GREY,
                    borderWidth: 3,
                    borderRadius: 8,
                    marginLeft: 10,
                    backgroundColor: colors.LIGHT_GREY,
                  }}
                  codeTextStyle={{
                    fontSize: (sm_width && 20) || (md_width && 20),
                  }}
                  flagButtonStyle={{
                    backgroundColor: colors.LIGHT_GREY,
                    borderRadius: 8,
                    width: "27%",
                  }}
                  containerStyle={{
                    width: "100%",
                    justifyContent: "space-between",
                    backgroundColor: "none",
                    marginBottom: 10,
                  }}
                  defaultCode="US"
                  layout="first"
                  editable={!!state.verificationId ? false : true}
                  onChangeText={(value) =>
                    setState({ ...state, contact: value })
                  }
                  onChangeFormattedText={(text) => {
                    setFormattedValue(text);
                  }}
                  withShadow
                  onFocus={() => {
                    setAutoFocus(true);
                  }}
                  onBlur={() => {
                    setAutoFocus(false);
                  }}
                />
              </SafeAreaView>
            </View>
          ) : (
            <>
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    marginBottom: 10,
                    fontFamily: "Uber Move",
                    fontWeight: "bold",
                  }}
                >
                  {"Enter your Email"}
                </Text>
              </View>
              <View style={styles.box2}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      textAlign: isRTL ? "right" : "left",
                      borderColor: autoFocus ? colors.BLUE : colors.LIGHT_GREY,
                      borderWidth: 3,
                      borderRadius: 8,
                      backgroundColor: colors.LIGHT_GREY,
                      padding: 20,
                    },
                  ]}
                  placeholder={"Enter your Email"}
                  onChangeText={(value) =>
                    setState({ ...state, contact: value })
                  }
                  value={state.contact}
                  editable={!!state.verificationId ? false : true}
                  placeholderTextColor={colors.MAP_TEXT}
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          {isNaN(state.contact) && loginType == "email" ? (
            <View
              style={[
                styles.box2,
                {
                  flexDirection: isRTL ? "row-reverse" : "row",
                  borderWidth: 1,
                  alignContent: "center",
                },
              ]}
            >
              <TextInput
                style={[
                  styles.textInput1,
                  {
                    textAlign: isRTL ? "right" : "left",
                    borderColor: autoFocus ? colors.BLUE : colors.LIGHT_GREY,
                  },
                ]}
                placeholder={t("password")}
                onChangeText={(value) =>
                  setState({ ...state, verificationCode: value })
                }
                value={state.verificationCode}
                secureTextEntry={eyePass}
                placeholderTextColor={colors.MAP_TEXT}
              />
              <TouchableOpacity
                onPress={() => setEyePass(!eyePass)}
                style={{ marginTop: 10, width: 40, marginLeft: isRTL ? 0 : 10 }}
              >
                {eyePass ? (
                  <Feather name="eye-off" size={20} color={colors.HEADER} />
                ) : (
                  <Feather name="eye" size={20} color={colors.HEADER} />
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {state.verificationId ? null : (
            <TouchableOpacity
              style={{
                backgroundColor: "#1d74e7",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                paddingHorizontal: 10,
                paddingVertical: 15,
                borderRadius: 12,
                elevation: 15,
              }}
              onPress={onPressLogin}
            >
              <Text
                style={{
                  color: colors.WHITE,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {"Continue"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!!state.verificationId ? (
          <View style={styles.box2}>
            <TextInput
              style={[
                styles.textInput,
                { textAlign: isRTL ? "right" : "left" },
              ]}
              placeholder={t("otp_here")}
              onChangeText={(value) =>
                setState({ ...state, verificationCode: value })
              }
              value={state.verificationCode}
              editable={!!state.verificationId}
              keyboardType="phone-pad"
              secureTextEntry={true}
              placeholderTextColor={colors.MAP_TEXT}
            />
          </View>
        ) : null}
        {!!state.verificationId ? (
          <MaterialButtonDark
            onPress={onSignIn}
            style={[styles.materialButtonDark, { fontSize: 20 }]}
          >
            {t("verify_otp")}
          </MaterialButtonDark>
        ) : null}

        {state.verificationId || isNaN(state.contact) ? (
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            {state.verificationId ||
            (isNaN(state.contact) && loginType == "email") ? (
              <View style={styles.actionLine}>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={CancelLogin}
                >
                  <Text style={styles.actionText}>{t("cancel")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {isNaN(state.contact) && loginType == "email" ? (
              <View style={styles.actionLine}>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={forgotPassword}
                >
                  <Text style={styles.actionText}>{t("forgot_password")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : null}
        {(Platform.OS == "ios" && settings && settings.AppleLoginEnabled) ||
        (settings && settings.FacebookLoginEnabled) ? (
          <View style={styles.seperator}>
            <View style={styles.lineLeft}></View>
            <View style={styles.lineLeftFiller}>
              <Text style={styles.sepText}>{t("spacer_message")}</Text>
            </View>
            <View style={styles.lineRight}></View>
          </View>
        ) : null}
        <View
          style={{
            width: "90%",
            alignSelf: "center",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {loginType == "mobile" ? (
            <View style={{ marginBottom: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.LIGHT_GREY,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 12,
                  elevation: 15,
                }}
                onPress={onEmailLogin}
              >
                <Image
                  source={require("../../assets/images/image.png")}
                  resizeMode="contain"
                  style={styles.socialIconImage}
                ></Image>
                <Text
                  style={{
                    color: colors.BLACK,
                    fontSize: 18,
                    marginLeft: 6,
                  }}
                >
                  {"Continue with Email"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginBottom: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.LIGHT_GREY,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 12,
                  elevation: 15,
                }}
                onPress={onPhoneLogin}
              >
                <Image
                  source={require("../../assets/images/phone.png")}
                  resizeMode="contain"
                  style={styles.socialIconImage}
                ></Image>
                <Text
                  style={{
                    color: colors.BLACK,
                    fontSize: 18,
                    marginLeft: 6,
                  }}
                >
                  {"Continue with Phone Otp"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {Platform.OS == "ios" ||
          (Platform.OS == "android" && settings.AppleLoginEnabled) ? (
            <View style={{ marginBottom: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.LIGHT_GREY,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 12,
                  elevation: 15,
                }}
                onPress={AppleLogin}
              >
                <Icon
                  name="logo-apple"
                  type="ionicon"
                  color={colors.BLACK}
                  size={32}
                  style={{ paddingRight: 8 }}
                />
                <Text
                  style={{
                    color: colors.BLACK,
                    fontSize: 18,
                  }}
                >
                  {"Continue with Apple"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {(Platform.OS == "ios" && settings && settings.AppleLoginEnabled) ||
          (settings && settings.FacebookLoginEnabled) ? (
            <View style={{ marginBottom: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.LIGHT_GREY,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderRadius: 12,
                  elevation: 15,
                }}
                onPress={FbLogin}
              >
                <Icon
                  name="logo-facebook"
                  type="ionicon"
                  color="#3b5998"
                  size={32}
                  style={{ paddingRight: 8 }}
                />
                <Text
                  style={{
                    color: colors.BLACK,
                    fontSize: 18,
                  }}
                >
                  {"Continue with Facebook"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
              opacity: 0.65,
              marginTop: 15,
              paddingBottom: 15,
            }}
          >
            <Text style={{ fontSize: 20, paddingRight: 4 }}>
              {"Don't have Account?"}
            </Text>
            <TouchableOpacity onPress={openRegister}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Roboto-Regular",
                  fontWeight: "bold",
                  textDecorationLine: "underline",
                  color: "blue",
                }}
              >
                {"Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              paddingHorizontal: 17,
              marginTop: 15,
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#838383",
                fontFamily: "Roboto-Regular",
                lineHeight: 25,
                paddingBottom: 80,
              }}
            >
              By proceeding, you consent to get calls, WatsApp or SMS messages,
              including by automated dialer, from Point To Point Express on
              +1(801) 528-7825 to the number provided.
            </Text>
          </View>
        </View>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.BLUE} size="large" />
          </View>
        ) : null}
      </ScrollView>
      {/* {state.verificationId ? null : (
        <MaterialButtonDark
          onPress={onPressLogin}
          style={styles.materialButtonDark}
        >
          {isNaN(state.contact) ? t("signIn") : t("request_otp")}
        </MaterialButtonDark>
      )} */}

      {/* {(Platform.OS == "ios" && settings && settings.AppleLoginEnabled) ||
      (settings && settings.FacebookLoginEnabled) ? (
        <View style={styles.socialBar}>
          {settings && settings.FacebookLoginEnabled ? (
            <TouchableOpacity style={styles.socialIcon} onPress={FbLogin}>
              <Image
                source={require("../../assets/images/image_fb.png")}
                resizeMode="contain"
                style={styles.socialIconImage}
              ></Image>
            </TouchableOpacity>
          ) : null}
          {Platform.OS == "ios" && settings.AppleLoginEnabled ? (
            <TouchableOpacity style={styles.socialIcon} onPress={AppleLogin}>
              <Image
                source={require("../../assets/images/image_apple.png")}
                resizeMode="contain"
                style={styles.socialIconImage}
              ></Image>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null} */}
      <View style={styles.footer}>
        <Text style={{ marginHorizontal: 18, fontWeight: "bold" }}>
          &copy;
          <Text style={{ fontWeight: "bold" }}>Point To Point Express </Text>
          {now}
        </Text>
        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={openTerms}>
          <Text style={styles.actionText}>{t("terms")}</Text>
        </TouchableOpacity>
      </View>
      {/* </ImageBackground> */}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  imagebg: {
    position: "absolute",
    left: 0,
    top: 0,
    width: Dimensions.get("window").width,
    height:
      Dimensions.get("window").height +
      (Platform.OS == "android" && !__DEV__ ? 40 : 0),
  },
  topBar: {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    height:
      Dimensions.get("window").height * 0.52 +
      (Platform.OS == "android" && !__DEV__ ? 40 : 0),
  },
  backButton: {
    height: 40,
    width: 40,
    marginTop: 30,
  },
  segmentcontrol: {
    color: colors.WHITE,
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    marginTop: 0,
    alignSelf: "center",
    height: 50,
    marginLeft: 35,
    marginRight: 35,
  },
  box1: {
    height: 45,
    backgroundColor: colors.WHITE,
    marginTop: Platform.OS === "ios" ? 26 : 0,
    marginLeft: 35,
    marginRight: 35,
    borderWidth: 1,
    borderColor: colors.BORDER_BACKGROUND,
    justifyContent: "center",
    borderRadius: 5,
  },

  box2: {
    height: 60,
    width: width - 40,
    backgroundColor: colors.WHITE,
    marginTop: 5,
    borderWidth: 1,
    borderColor: colors.BORDER_BACKGROUND,
    justifyContent: "center",
    borderRadius: 5,
    margin: 10,
    marginLeft: 5,
  },
  textInput: {
    color: colors.BACKGROUND,
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    width: "100%",
    height: 60,
  },
  textInput1: {
    color: colors.BACKGROUND,
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    width: width - 130,
  },
  materialButtonDark: {
    height: 55,
    marginTop: 15,
    marginLeft: 30,
    marginRight: 20,
    backgroundColor: colors.BLUE,
    borderRadius: 10,
    fontSize: 20,
  },
  linkBar: {
    flexDirection: "row",
    marginTop: 30,
    alignSelf: "center",
  },
  barLinks: {
    marginLeft: 15,
    marginRight: 15,
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
  },
  pickerStyle: {
    color: colors.BACKGROUND,
    fontFamily: "Roboto-Regular",
    fontSize: 18,
    marginLeft: 5,
  },

  actionLine: {
    height: 20,
    flexDirection: "row",
    marginTop: 15,
    alignSelf: "center",
  },
  actionItem: {
    height: 20,
    marginLeft: 15,
    marginRight: 15,
    alignSelf: "center",
  },
  actionText: {
    fontSize: 15,
    fontFamily: "Roboto-Regular",
    fontWeight: "bold",
    color: colors.HEADER,
  },
  actionLine: {
    height: 20,
    flexDirection: "row",
    marginTop: 20,
    alignSelf: "center",
  },
  actionItem: {
    height: 20,
    marginLeft: 15,
    marginRight: 15,
    alignSelf: "center",
  },
  seperator: {
    width: 250,
    height: 20,
    flexDirection: "row",
    marginTop: 15,
    alignSelf: "center",
  },
  lineLeft: {
    width: 50,
    height: 1,
    backgroundColor: "rgba(113,113,113,1)",
    marginTop: 9,
  },
  sepText: {
    color: colors.HEADER,
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    opacity: 0.8,
  },
  lineLeftFiller: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  lineRight: {
    width: 50,
    height: 1,
    backgroundColor: "rgba(113,113,113,1)",
    marginTop: 9,
  },
  socialBar: {
    height: 40,
    flexDirection: "row",
    marginTop: 10,
    alignSelf: "center",
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginLeft: 15,
    marginRight: 15,
    alignSelf: "center",
  },
  socialIconImage: {
    width: 40,
    height: 40,
  },
  footer: {
    //marginTop: Platform.OS === "ios" ? 20 : 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: colors.LIGHT_GREY,
    paddingBottom: 15,
    height: 55,
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
  terms: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    opacity: 0.65,
  },
  pickerStyle1: {
    color: colors.BLACK,
    width: 68,
    fontSize: 15,
    height: 30,
    fontWeight: "bold",
  },
  headLanuage: {
    position: "absolute",
    top: Platform.OS == "android" && !__DEV__ ? 50 : 50,
    flexDirection: "row",
    borderWidth: 0.4,
    borderRadius: 20,
    alignItems: "center",
  },
});
