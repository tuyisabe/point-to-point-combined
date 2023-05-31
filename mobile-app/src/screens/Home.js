/** @format */

import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Text,
  Platform,
  Alert,
  ScrollView,
  StatusBar,
  Animated,
  FlatList,
} from "react-native";
import { Icon, Tooltip, Button, Badge, Header } from "react-native-elements";
import i18n from "i18n-js";
import { colors } from "../common/theme";
import { TouchableOpacity } from "react-native-gesture-handler";
const { width, height } = Dimensions.get("window");

function infiniteScroll(flatListRef, dataList) {
  const numberOfData = dataList.length;
  let scrollValue = 0,
    scrolled = 0;

  setInterval(function () {
    scrolled++;
    if (scrolled < numberOfData) scrollValue = scrollValue + width;
    else {
      scrollValue = 0;
      scrolled = 0;
    }

    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({
        animated: true,
        offset: scrollValue,
      });
    }
  }, 5000);
}
const data = [
  {
    title: "SLC Airport Ride, Shuttle",
    description:
      "We provide Airport Ride To or From Salt Lake City Int'l Airport, Professional Drivers, Comfortable, Quick, Easy, and Hassle-Free Booking.",
    image: require("../../assets/images/2022-point-to-point-express-toyota-sienna-1024x676.png"),
  },
  {
    title: "SLC Luxury Airport Ride",
    description:
      "Choose from our collection of new SUVs. Ride in Style, our fleet offers a variety of options to and from SLC Int'l Airport, ensuring a luxurious and comfortable ride.",
    image: require("../../assets/images/2022-point-to-pont-express-chevy-suburban-1024x676.png"),
  },
  {
    title: "SLC Van Airport Ride",
    description:
      "We make sure that every trip is safe and comfortable. We provide a variety of options for any size group. Fast pick-up service and professional drivers.",
    image: require("../../assets/images/mercedes-benz-sprinter-color-942597.jpg"),
  },
];
const ITEM_WIDTH = width;
const ITEM_HEIGHT = height * 0.75;
const DOT_SIZE = 10;
const DOT_SPACING = 10;
const DOT_INDICATOR_SIZE = DOT_SIZE + DOT_SPACING;
const VIEW_WIDTH = height / 1.6;
const sm_width = width * 2;
const md_width = width * 2.625;
const sm_height = height * 0.9;
const md_height = height * 1.688;
function Home(props) {
  const pageActive = useRef(false);
  let flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [dataList, setDataList] = useState(data);
  const { t } = i18n;

  useEffect(() => {
    setDataList(data);
    infiniteScroll(flatListRef, dataList);
  });

  const openLogin = () => {
    pageActive.current = false;
    props.navigation.navigate("Login");
  };
  const openRegister = () => {
    pageActive.current = false;
    props.navigation.navigate("Register");
  };

  return (
    <View style={styles.contentView}>
      <StatusBar
        hidden={false}
        barStyle={"dark-content"}
        backgroundColor={colors.TRANSPARENT}
      />
      <Header
        backgroundColor={colors.WHITE}
        // leftComponent={isRTL ? null:lCom}
        // rightComponent={isRTL? rCom:null}
        containerStyle={styles.headerContainerStyle}
        innerContainerStyles={styles.headerInnerContainer}
      />

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
          marginBottom: 5,
        }}
      >
        <View
          style={{
            alignItems: "center",
            width: width - 80,
            height: height / 6,
            marginTop: 10,
          }}
        >
          <Image
            source={require("../../assets/images/CombineLogo.png")}
            style={{
              width: width - 20,
              height: "90%",
              resizeMode: "contain",
            }}
          />
        </View>
      </View>
      <View style={{ height: VIEW_WIDTH, width: width, overflow: "hidden" }}>
        <Animated.FlatList
          data={data}
          ref={flatListRef}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          scrollEnabled
          snapToAlignment="center"
          scrollEventThrottle={16}
          decelerationRate={"fast"}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          renderItem={({ item }) => {
            return (
              <View style={{}}>
                <View
                  style={{
                    width: (sm_width && ITEM_WIDTH) || (md_width && ITEM_WIDTH),
                    height:
                      (sm_width && ITEM_HEIGHT / 3.5) ||
                      (md_height && ITEM_HEIGHT / 4),
                  }}
                >
                  <Text style={styles.textStyle1}>{item.title}</Text>
                  <Text style={styles.textStyle2}>{item.description}</Text>
                </View>
                <View
                  style={{
                    alignItems: "center",
                    width: (sm_width && width - 20) || (md_width && width - 20),
                    height:
                      (sm_height && height / 3) || (md_height && width - 20),
                    marginLeft: 5,
                    marginTop: 5,
                  }}
                >
                  <Image
                    source={item.image}
                    style={{
                      width: (sm_width && "75%") || (sm_width && "90%"),
                      height: (sm_height && "75%") || (sm_height && "90%"),
                      resizeMode: "cover",
                      marginTop: 15,
                    }}
                  />
                </View>
              </View>
            );
          }}
        />
      </View>

      <View
        style={{
          position: "absolute",
          bottom: -15,
          left: 0,
          right: 0,
          height: 115,
          backgroundColor: colors.WHITE,
          borderRadius: 20,
          elevation: 20,
        }}
      >
        <View style={styles.pagination}>
          {data.map((_, index) => {
            return <View style={[styles.dot]} key={index} />;
          })}
          <Animated.View
            style={[
              styles.dotIndicator,
              {
                transform: [
                  {
                    translateX: Animated.divide(
                      scrollX,
                      ITEM_WIDTH
                    ).interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, DOT_INDICATOR_SIZE],
                    }),
                  },
                ],
              },
            ]}
          ></Animated.View>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            borderWidth: 3,
            marginLeft: -2.5,
            marginRight: -2.5,
            borderColor: colors.BLUE,
            paddingTop: 15,
          }}
        >
          <TouchableOpacity
            style={{
              paddingVertical: 5,
              backgroundColor: colors.BLUE,
              width: width / 1.2,
              borderRadius: 8,
              justifyContent: "flex-end",
              flexDirection: "row",
              paddingHorizontal: 30,
            }}
            onPress={openLogin}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: 220,
                marginRight: -18,
              }}
            >
              <Text
                style={{
                  color: colors.WHITE,
                  fontFamily: "Uber Move",
                  fontStyle: "normal",
                  fontWeight: "bold",
                  fontSize: 20,
                  lineHeight: 21,
                  alignSelf: "center",
                }}
              >
                {"Get Started"}
              </Text>
              <Icon
                type="ionicon"
                name={"arrow-forward-sharp"}
                color={colors.WHITE}
                size={40}
              ></Icon>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default Home;
const styles = StyleSheet.create({
  contentView: {
    flex: 1,

    backgroundColor: colors.WHITE,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  headerContainerStyle: {
    backgroundColor: colors.TRANSPARENT,
    borderBottomWidth: 0,
  },
  headerInnerContainer: {
    marginLeft: 10,
    marginRight: 10,
  },
  HeaderView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: colors.WHITE,
  },
  image1: {
    height: 50,
    width: 50,
  },
  divCompView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "95%",
    marginLeft: 10,
    marginVertical: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    //   flexWrap: 'wrap',
    justifyContent: "flex-end",
    alignItems: "center",
    width: "50%",
    marginVertical: 10,
  },
  subHeader: {
    backgroundColor: "#2089dc",
    color: "white",
    textAlign: "center",
    paddingVertical: 5,
    marginBottom: 10,
  },
  pagination: {
    position: "absolute",
    top: 16,
    left: ITEM_WIDTH / 2.5,
    flexDirection: "row",
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE,
    backgroundColor: colors.BLUE,
    marginLeft: DOT_SPACING,
  },
  dotIndicator: {
    width: DOT_INDICATOR_SIZE,
    height: DOT_INDICATOR_SIZE,
    borderRadius: DOT_INDICATOR_SIZE,
    borderWidth: 1,
    borderColor: colors.BLUE,
    marginLeft: DOT_SPACING,
    position: "absolute",
    top: -DOT_SIZE / 2,
    left: -DOT_SIZE / 2,
  },
  textStyle1: {
    color: colors.BLUE,
    fontFamily: "Uber Move",
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: 23,
    fontSize: 23,
    marginLeft: 30,
    width: "90%",
    marginTop: 10,
  },
  textStyle2: {
    marginTop: 10,
    color: "#2B1B17",
    fontFamily: "Uber Move",
    fontStyle: "italic",
    fontWeight: "700",
    lineHeight: 23,
    fontSize: 18,
    marginBottom: 20,
    marginLeft: 30,
    width: "90%",
  },
});
