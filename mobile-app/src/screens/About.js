/** @format */

import React from "react";
import { Header } from "react-native-elements";
import { colors } from "../common/theme";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
var { width, height } = Dimensions.get("window");
import { DrawerActions } from "@react-navigation/native";

import i18n from "i18n-js";

export default function AboutPage(props) {
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const lCom = {
    icon: "md-menu",
    type: "ionicon",
    color: "#1d74e7",
    size: 45,
    component: TouchableWithoutFeedback,
    onPress: () => {
      props.navigation.dispatch(DrawerActions.toggleDrawer());
    },
  };
  const rCom = {
    icon: "md-menu",
    type: "ionicon",
    color: "#1d74e7",
    size: 45,
    component: TouchableWithoutFeedback,
    onPress: () => {
      props.navigation.dispatch(DrawerActions.toggleDrawer());
    },
  };
  return (
    <View style={styles.mainView}>
      {/* <Header
        backgroundColor={colors.BLUE}
        leftComponent={isRTL ? null : lCom}
        rightComponent={isRTL ? rCom : null}
        centerComponent={
          <Text style={styles.headerTitleStyle}>{t("about_us_menu")}</Text>
        }
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      /> */}
      <ScrollView>
        <View
          style={{
            flexDirection: "column",
            alignSelf: "center",
            width: width - 20,
          }}
        >
          <View
            style={{
              marginTop: 0,
              marginBottom: 40,
              alignSelf: "center",
              marginLeft: 20,
              marginRight: 20,
            }}
          >
            <Image
              style={{
                width: 400,
                height: 100,
                borderRadius: 15,
                marginTop: 0,
              }}
              source={require("../../assets/images/logo-1.png")}
            />
          </View>
          <View style={{ width: "100%" }}>
            <Text
              style={{
                textAlign: isRTL ? "right" : "center",
                fontSize: 20,
                lineHeight: 28,
              }}
            >
              {
                "We are the most reliable provider of Airport Ride, Airport Shuttle, Airport Transfer & Airport Transportation in SLC Utah."
              }
            </Text>

            <View
              style={{
                height: height / 4,
                width: "100%",
                marginTop: 0,
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Image
                style={{
                  width: "47%",
                  height: "95%",
                  borderRadius: 15,
                }}
                source={require("../../assets/images/imageCar3.jpeg")}
              />
              <Image
                style={{
                  width: "47%",
                  height: "95%",
                  borderRadius: 15,

                  marginLeft: 10,
                }}
                source={require("../../assets/images/imageCar.jpeg")}
              />
            </View>
            <Text
              style={{
                textAlign: isRTL ? "right" : "center",
                fontSize: 20,
                lineHeight: 28,
                marginTop: 40,
                marginBottom: 20,
              }}
            >
              Our online booking system makes it easy for you to manage
              bookings, request quotes, or book an airport ride quickly. We
              offer rides to and from Salt Lake City International Airport (SLC)
              and specialize in shuttles, transfers, and ground transportation
              services. Choose Point To Point Express, LLC for the best airport
              ride experience in Utah.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
    //marginTop: StatusBar.currentHeight,
  },
  headerStyle: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    color: colors.BLUE,
    fontFamily: "Uber Move",
    fontStyle: "normal",
    fontWeight: "bold",
    lineHeight: 24,
    textAlign: "center",
    fontSize: 22,
    marginTop: 10,
  },
  aboutTitleStyle: {
    color: colors.BLACK,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
    marginLeft: 8,
    marginTop: 8,
  },
  aboutcontentmainStyle: {
    marginTop: 12,
    marginBottom: 60,
  },
  contact: {
    marginTop: 6,
    marginLeft: 8,
    //flexDirection:'row',
    width: "100%",
    marginBottom: 30,
  },
});
