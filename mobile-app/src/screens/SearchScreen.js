/** @format */

import React, { useContext, useState, useEffect } from "react";
import { Icon } from "react-native-elements";
import { colors } from "../common/theme";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Keyboard,
  Image,
} from "react-native";
import i18n from "i18n-js";
import { api } from "common";
import { useSelector, useDispatch } from "react-redux";
import Footer from "../components/Footer";
import { checkSearchPhrase, appConsts } from "../common/sharedFunctions";
var { width } = Dimensions.get("window");
import { StackActions } from "@react-navigation/native";
import { FirebaseContext } from "common/src";

const appcat = "taxi";
export default function SearchScreen(props) {
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const {
    fetchCoordsfromPlace,
    fetchPlacesAutocomplete,
    updateTripPickup,
    updateTripDrop,
  } = api;
  
  const dispatch = useDispatch();
  const [searchResults, setSearchResults] = useState([]);
  const [isShowingResults, setIsShowingResults] = useState(false);
  const tripdata = useSelector((state) => state.tripdata);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const { locationType, addParam } = props.route.params;
  const [loading, setLoading] = useState();
  const settingsdata = useSelector((state) => state.settingsdata.settings);
  const [settings, setSettings] = useState({});
  const [searchKeywordPickup, setSearchKeywordPickup] = useState("");
  const [searchKeywordDrop, setSearchKeywordDrop] = useState("");
  const [selLocationsPickup, setSelLocationsPickup] = useState([]);
  const [selLocationsDrop, setSelLocationsDrop] = useState([]);
  const [selLocations, setSelLocations] = useState([]);
  let [locationTypes, setLocationTypes] = useState(locationType);
  useEffect(() => {
    if (settingsdata) {
      setSettings(settingsdata);
    }
  }, [settingsdata]);
  useEffect(() => {
    if (addParam.length <= 5) {
      setSavedAddresses(addParam);
    } else {
      setSavedAddresses(addParam.sort((a, b) => a.count < b.count).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    if (
      (tripdata.drop && locationTypes == "drop") ||
      (tripdata.pickup && locationTypes == "pickup")
    ) {
      let arr = [];
      if (tripdata.drop && tripdata.drop.waypoints) {
        const waypoints = tripdata.drop.waypoints;
        for (let i = 0; i < waypoints.length; i++) {
          arr.push(waypoints[i]);
        }
      }
      if (tripdata.drop.add) {
        arr.push({
          lat: tripdata.drop.lat,
          lng: tripdata.drop.lng,
          add: tripdata.drop.add,
          source: tripdata.drop.source,
        });
      }
      setSelLocationsDrop(arr);
    }
  }, [locationTypes, tripdata.drop]);

  useEffect(() => {
    if (
      (tripdata.pickup && locationTypes == "pickup") ||
      (tripdata.drop && locationTypes == "drop")
    ) {
      let arr1 = [];
      if (tripdata.pickup && tripdata.pickup.waypoints) {
        const waypoints1 = tripdata.pickup.waypoints;
        for (let i = 0; i < waypoints1.length; i++) {
          arr1.push(waypoints1[i]);
        }
      }
      if (tripdata.pickup.add) {
        arr1.push({
          lat: tripdata.pickup.lat,
          lng: tripdata.pickup.lng,
          add: tripdata.pickup.add,
          source: tripdata.pickup.source,
        });
      }
      setSelLocationsPickup(arr1);
    }
  }, [locationTypes, tripdata.pickup]);

  // useEffect(() => {
  //   if (tripdata.drop && locationType == 'drop') {
  //     let arr = []
  //     if (tripdata.drop && tripdata.drop.waypoints) {
  //       const waypoints = tripdata.drop.waypoints;
  //       for (let i = 0; i < waypoints.length; i++) {
  //         arr.push(waypoints[i]);
  //       }
  //     }
  //     if (tripdata.drop.add) {
  //       arr.push({
  //         lat: tripdata.drop.lat,
  //         lng: tripdata.drop.lng,
  //         add: tripdata.drop.add,
  //         source: tripdata.drop.source
  //       });
  //     }
  //     setSelLocations(arr);
  //   }
  // }, [locationType, tripdata.drop]);

  const searchLocation = async (text) => {
    setSearchKeyword(text);
    if (text.length > (settings.AllowCriticalEditsAdmin ? 3 : 5)) {
      const res = await fetchPlacesAutocomplete(text);
      if (res) {
        setSearchResults(res);
        setIsShowingResults(true);
      }
    }
  };

  const searchLocationDrop = async (text) => {
    setSearchKeywordDrop(text);

    if (text.length > (settings.AllowCriticalEditsAdmin ? 1 : 2)) {
      const res = await fetchPlacesAutocomplete(text);
      if (res) {
        setSearchResults(res);
        setIsShowingResults(true);
      }
    }
  };

  const searchLocationPickup = async (text) => {
    setSearchKeywordPickup(text);

    if (text.length > (settings.AllowCriticalEditsAdmin ? 1 : 2)) {
      const res = await fetchPlacesAutocomplete(text);
      if (res) {
        setSearchResults(res);
        setIsShowingResults(true);
      }
    }
  };

  // const updateLocation = (data) => {
  //   setLoading(true);
  //   setSearchKeyword(checkSearchPhrase(data.description));
  //   setIsShowingResults(false);
  //   if (data.place_id) {
  //     fetchCoordsfromPlace(data.place_id).then((res) => {
  //       if (res && res.lat) {
  //         if (locationType == 'pickup') {
  //           dispatch(updateTripPickup({
  //             lat: res.lat,
  //             lng: res.lng,
  //             add: data.description,
  //             source: 'search'
  //           }));
  //           if (appConsts.hasMultiDrop) {
  //             props.navigation.dispatch(StackActions.pop(1));
  //           }
  //         } else {
  //           if (appConsts.hasMultiDrop) {
  //             let arr = selLocations;
  //             arr.push({
  //               lat: res.lat,
  //               lng: res.lng,
  //               add: data.description,
  //               source: 'search'
  //             });
  //             Keyboard.dismiss();
  //             setSelLocations(arr);
  //           } else {
  //             dispatch(updateTripDrop({
  //               lat: res.lat,
  //               lng: res.lng,
  //               add: data.description,
  //               source: 'search'
  //             }));
  //           }
  //         }
  //         setLoading(false);
  //         if (!appConsts.hasMultiDrop) {
  //           props.navigation.dispatch(StackActions.pop(1));
  //         }
  //       } else {
  //         Alert.alert(t('alert'), t('place_to_coords_error'));
  //       }
  //     });
  //   } else {
  //     if (data.description) {
  //       if (locationType == 'pickup') {
  //         dispatch(updateTripPickup({
  //           lat: data.lat,
  //           lng: data.lng,
  //           add: data.description,
  //           source: 'search'
  //         }));
  //         if (appConsts.hasMultiDrop) {
  //           props.navigation.dispatch(StackActions.pop(1));
  //         }
  //       } else {
  //         if (appConsts.hasMultiDrop) {
  //           let arr = [...selLocations];
  //           let notFound = true;
  //           for (let i = 0; i < arr.length; i++) {
  //             if (arr[i].add == data.description) {
  //               notFound = false;
  //               break;
  //             }
  //           }
  //           if (notFound) {
  //             let entry = {
  //               lat: data.lat,
  //               lng: data.lng,
  //               add: data.description,
  //               source: 'search'
  //             };
  //             arr.push(entry);
  //           }
  //           Keyboard.dismiss();
  //           setSelLocations(arr);
  //         } else {
  //           dispatch(updateTripDrop({
  //             lat: data.lat,
  //             lng: data.lng,
  //             add: data.description,
  //             source: 'search'
  //           }));
  //         }

  //       }
  //       setLoading(false);
  //       if (!appConsts.hasMultiDrop) {
  //         props.navigation.dispatch(StackActions.pop(1));
  //       }
  //     }
  //   }
  // }

  const updateLocation = (data, data1) => {
    setLoading(true);
    appcat == "taxi"
      ? setSearchKeywordDrop("") && setSearchKeywordPickup("")
      : setSearchKeywordDrop(data.description) &&
        setSearchKeywordPickup(data1.description);
    setIsShowingResults(false);
    if (data.place_id) {
      fetchCoordsfromPlace(data.place_id).then((res) => {
        if (res && res.lat) {
          if (locationTypes == "pickup") {
            dispatch(
              updateTripPickup({
                lat: res.lat,
                lng: res.lng,
                add: data.description,
                source: "search",
              })
            );
            if (appcat == "taxi") {
              //props.navigation.pop();
              setSelLocationsPickup(searchKeywordPickup);
            }
          } else {
            dispatch(
              updateTripDrop({
                lat: res.lat,
                lng: res.lng,
                add: data.description,
                source: "search1",
              })
            );
            if (appcat == "taxi") {
              props.navigation.pop();
            }
          }
          setLoading(false);
          if (appcat == "delivery") {
            props.navigation.pop();
          }
        } else {
          Alert.alert(t("alert"), t("place_to_coords_error"));
        }
      });
    } else {
      if (data.description) {
        if (locationTypes == "pickup") {
          dispatch(
            updateTripPickup({
              lat: data.lat,
              lng: data.lng,
              add: data.description,
              source: "search",
            })
          );
          if (appcat == "taxi") {
            //props.navigation.pop();
            setSelLocationsPickup(searchKeywordPickup);
          }
        } else {
          if (appcat == "taxi") {
            dispatch(
              updateTripDrop({
                lat: data.lat,
                lng: data.lng,
                add: data.description,
                source: "search1",
              })
            );
            if (appcat == "taxi") {
              props.navigation.pop();
            }
          } else {
            dispatch(
              updateTripDrop({
                lat: data.lat,
                lng: data.lng,
                add: data.description,
                source: "search1",
              })
            );
          }
        }
        setLoading(false);
        if (appcat == "delivery") {
          props.navigation.pop();
        }
      }
    }
  };

  const okClicked = () => {
    let waypoints = [...selLocations];
    waypoints.splice(selLocations.length - 1, 1);
    let dropObj = {
      ...selLocations[selLocations.length - 1],
      waypoints: waypoints,
    };
    dispatch(updateTripDrop(dropObj));
    props.navigation.dispatch(StackActions.pop(1));
  };

  // const removeItem = (index) => {
  //   let arr = [...selLocations];
  //   arr.splice(index, 1);
  //   setSelLocations(arr);
  // };

  const changepickup = () => {
    setLocationTypes("pickup");
  };

  const changedrop = () => {
    setLocationTypes("drop");
  };
  const removePickupItem = (index) => {
    let arr = [...selLocationsPickup];
    arr.splice(index, 1);
    setSelLocationsPickup(arr);
  };

  const removeDropItem = (index) => {
    let arr1 = [...selLocationsDrop];
    arr1.splice(index, 1);
    setSelLocationsDrop(arr1);
  };

  return (
    <View style={{ flex: 1 }}>
      <Footer />
      <View
        style={{
          flex: 1,
          position: "absolute",
          backgroundColor: colors.TRANSPARENT,
          height: "100%",
          width: "100%",
        }}
      >
        <View>
          {selLocations.length > 0 ? (
            <FlatList
              data={selLocations}
              renderItem={({ item, index }) => {
                return (
                  <View
                    key={"key" + index}
                    style={{
                      flexDirection: isRTL ? "row-reverse" : "row",
                      width: "100%",
                    }}
                  >
                    <Text
                      style={{
                        paddingLeft: 15,
                        width: width - 40,
                        fontSize: 18,
                        color: colors.SEARCH_TEXT,
                        paddingTop: 6,
                        paddingBottom: 6,
                      }}
                      numberOfLines={1}
                    >
                      {item.add}
                    </Text>
                    <TouchableOpacity
                      style={{ paddingLeft: 0 }}
                      onPress={() => removeItem(index)}
                    >
                      <Image
                        source={require("../../assets/images/cross.png")}
                        style={{ height: 30, width: 30 }}
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
              keyExtractor={(item) => item.add}
              style={styles.multiLocation}
            />
          ) : null}
          <View></View>
        </View>
        {/* <View style={[styles.autocompleteMain, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Icon
            name='search'
            type='Feather'
            color={colors.HEADER}
            size={30}
            style={[isRTL ? { left: 0, right: 5 } : { left: 5, right: 0 }]} />

          <TextInput
            placeholder={t('search_for_an_address')}
            returnKeyType="search"
            style={[styles.searchBox, isRTL ? { paddingRight: 15, textAlign: 'right' } : { paddingLeft: 15, textAlign: 'left' }]}
            placeholderTextColor="#000"
            onChangeText={(text) => searchLocation(text)}
            value={searchKeyword}
          />
        </View> */}

        <View
          style={[
            styles.autocompleteMain,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Icon
              name="map-marker-outline"
              type="material-community"
              color={colors.BALANCE_GREEN}
              size={35}
              style={[isRTL ? { left: 0, right: 5 } : { left: 5, right: 0 }]}
            />
          </TouchableOpacity>

          {selLocationsPickup && selLocationsPickup.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                height: 70,
              }}
            >
              <Text
                style={{
                  paddingLeft: 10,
                  width: width - 100,
                  color: colors.BLACK,
                  fontFamily: "Uber Move",
                  fontStyle: "normal",
                  fontWeight: "500",
                  lineHeight: 24,
                  fontSize: 20,
                }}
                numberOfLines={1}
              >
                {selLocationsPickup[0].add}
              </Text>
              <TouchableOpacity
                style={{ paddingLeft: 0 }}
                onPress={() => removePickupItem(selLocationsPickup[0])}
              >
                <Icon
                  name="close-sharp"
                  type="ionicon"
                  color="#1d74e7"
                  size={30}
                  style={[
                    isRTL ? { left: 0, right: 5 } : { left: 5, right: 0 },
                  ]}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                placeholder={"Change current Location"}
                returnKeyType="search"
                style={[
                  styles.searchBox,
                  isRTL
                    ? { paddingRight: 15, textAlign: "right" }
                    : { paddingLeft: 15, textAlign: "left" },
                ]}
                placeholderTextColor="#000"
                onChangeText={(text) => {
                  {
                    searchLocationPickup(text), changepickup();
                  }
                }}
                //value={searchKeywordPickup}
              />
            </>
          )}
        </View>

        <View
          style={[
            styles.autocompleteMain,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Icon
              name="magnify"
              type="material-community"
              color={colors.RED}
              size={35}
              style={[isRTL ? { left: 0, right: 5 } : { left: 5, right: 0 }]}
            />
          </TouchableOpacity>

          {selLocationsDrop && selLocationsDrop.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                height: 70,
              }}
            >
              <Text
                style={{
                  paddingLeft: 10,
                  width: width - 100,
                  color: colors.BLACK,
                  fontFamily: "Uber Move",
                  fontStyle: "normal",
                  fontWeight: "500",
                  lineHeight: 24,
                  fontSize: 20,
                }}
                numberOfLines={1}
              >
                {selLocationsDrop[0].add}
              </Text>
              <TouchableOpacity
                style={{ paddingLeft: 0, marginEnd: 5 }}
                onPress={() => removeDropItem(selLocationsDrop[0])}
              >
                <Icon
                  name="close-sharp"
                  type="ionicon"
                  color="#1d74e7"
                  size={30}
                  style={[
                    isRTL ? { left: 0, right: 5 } : { left: 5, right: 0 },
                  ]}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                placeholder={"Enter Drop Off Address"}
                returnKeyType="search1"
                style={[
                  styles.searchBox,
                  isRTL
                    ? { paddingRight: 15, textAlign: "right" }
                    : { paddingLeft: 15, textAlign: "left" },
                ]}
                placeholderTextColor="#000"
                onChangeText={(text) => {
                  searchLocationDrop(text), changedrop();
                }}
                value={searchKeywordDrop}
              />
            </>
          )}
        </View>

        {isShowingResults || savedAddresses ? (
          <FlatList
            keyboardShouldPersistTaps="always"
            data={isShowingResults ? searchResults : savedAddresses}
            renderItem={({ item, index }) => {
              return (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Icon
                    name={"location-sharp"}
                    type={"ionicon"}
                    size={25}
                    color="#1d74e7"
                  />
                  <TouchableOpacity
                    key={item.description}
                    style={styles.resultItem}
                    onPress={() => {
                      updateLocation(item);
                    }}
                  >
                    <Text numberOfLines={3} style={styles.description}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            style={styles.searchResultsContainer}
          />
        ) : null}
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.BLUE} size="large" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  floting: {
    width: "70%",
    height: 45,
    position: "absolute",
    bottom: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    shadowColor: colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
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
  autocompleteMain: {
    backgroundColor: colors.WALLET_PRIMARY,
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
  },
  searchBox: {
    width: "90%",
    height: 50,
    fontSize: 18,
    borderColor: "#ccc",
    color: "#000",
    backgroundColor: colors.WALLET_PRIMARY,
    borderRadius: 10,
  },
  description: {
    color: colors.SEARCH_TEXT,
    textAlign: "left",
    fontSize: 18,
  },
  resultItem: {
    width: "100%",
    justifyContent: "center",
    paddingVertical: 10,
    borderBottomColor: colors.HEADER,
    borderBottomWidth: 0.3,
    backgroundColor: colors.WHITE,
    alignItems: "flex-start",
  },
  searchResultsContainer: {
    width: "100%",
    paddingHorizontal: 15,
  },
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    color: colors.HEADER,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
  },
  multiLocation: {
    marginTop: 10,
  },
});
