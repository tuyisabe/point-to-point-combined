/* eslint-disable no-shadow */
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { Dimensions, Text, View, TouchableOpacity } from "react-native";
import { scale } from "react-native-size-scaling";
import Svg, { Path } from "react-native-svg";
import { useDeviceOrientation } from "./useDeviceOrientation";
import { getPath, getPathUp } from "./path";
import { styles } from "./styles";
const { width: maxW } = Dimensions.get("window");
const Tab = createBottomTabNavigator();
const BottomBarComponent = React.forwardRef((props, ref) => {
  const SVG = Svg;
  const PATH = Path;
  const {
    type = "DOWN",
    style,
    width = null,
    height = 65,
    circleWidth = 50,
    bgColor = "gray",
    initialRouteName,
    tabBar,
    renderCircle,
    borderTopLeftRight = false,
    strokeWidth = 0,
    strokeColor = "#DDDDDD",
  } = props;
  const [itemLeft, setItemLeft] = useState([]);
  const [itemRight, setItemRight] = useState([]);
  const [maxWidth, setMaxWidth] = useState(width || maxW);
  const [isShow, setIsShow] = useState(true);
  const children = props === null || props === void 0 ? void 0 : props.children;
  const orientation = useDeviceOrientation();
  useImperativeHandle(ref, () => {
    return { setVisible };
  });
  const setVisible = (visible) => {
    setIsShow(visible);
  };
  useEffect(() => {
    const { width: w } = Dimensions.get("window");
    if (!width) {
      setMaxWidth(w);
    }
  }, [orientation, width]);
  const _renderButtonCenter = (focusedTab, navigate) => {
    var _a, _b;
    const getTab =
      (_b =
        (_a = children.filter((e) => {
          var _a;
          return (
            ((_a = e === null || e === void 0 ? void 0 : e.props) === null ||
            _a === void 0
              ? void 0
              : _a.position) === "CENTER"
          );
        })[0]) === null || _a === void 0
          ? void 0
          : _a.props) === null || _b === void 0
        ? void 0
        : _b.name;
    return renderCircle({
      routeName: getTab,
      selectedTab: focusedTab,
      navigate: (selectTab) => {
        if (selectTab) {
          navigate(selectTab);
        }
      },
    });
  };
  useEffect(() => {
    const arrLeft = children.filter((item) => {
      var _a;
      return (
        ((_a = item === null || item === void 0 ? void 0 : item.props) ===
          null || _a === void 0
          ? void 0
          : _a.position) === "LEFT"
      );
    });
    const arrRight = children.filter((item) => {
      var _a;
      return (
        ((_a = item === null || item === void 0 ? void 0 : item.props) ===
          null || _a === void 0
          ? void 0
          : _a.position) === "RIGHT"
      );
    });
    setItemLeft(arrLeft);
    setItemRight(arrRight);
  }, [children, initialRouteName]);
  const d =
    type === "DOWN"
      ? getPath(
          maxWidth,
          height,
          circleWidth >= 50 ? circleWidth : 50,
          borderTopLeftRight
        )
      : getPathUp(
          maxWidth,
          height + 30,
          circleWidth >= 50 ? circleWidth : 50,
          borderTopLeftRight
        );
  const renderItem = ({ color, routeName, navigate }) => {
    return React.createElement(
      TouchableOpacity,
      {
        key: routeName,
        style: styles.itemTab,
        onPress: () => navigate(routeName),
      },
      React.createElement(Text, { style: { color: color } }, routeName)
    );
  };
  const MyTabBar = (props) => {
    const { state, navigation } = props;
    const focusedTab =
      state === null || state === void 0
        ? void 0
        : state.routes[state.index].name;
    if (!isShow) {
      return null;
    }
    return React.createElement(
      View,
      { style: [styles.container, style] },
      React.createElement(
        SVG,
        {
          width: maxWidth,
          height: scale(height) + (type === "DOWN" ? 0 : scale(30)),
        },
        React.createElement(
          PATH,
          Object.assign(
            { fill: bgColor, stroke: strokeColor, strokeWidth: strokeWidth },
            { d }
          )
        )
      ),
      React.createElement(
        View,
        {
          style: [
            styles.main,
            { width: maxWidth },
            type === "UP" && styles.top30,
          ],
        },
        React.createElement(
          View,
          { style: [styles.rowLeft, { height: scale(height) }] },
          itemLeft.map((item, index) => {
            var _a;
            const routeName =
              (_a = item === null || item === void 0 ? void 0 : item.props) ===
                null || _a === void 0
                ? void 0
                : _a.name;
            if (tabBar === undefined) {
              return renderItem({
                routeName,
                color: focusedTab === routeName ? "blue" : "gray",
                navigate: navigation.navigate,
              });
            }
            return React.createElement(
              View,
              { style: styles.flex1, key: index.toString() },
              tabBar({
                routeName,
                selectedTab: focusedTab,
                navigate: (selectTab) => {
                  if (selectTab !== focusedTab) {
                    navigation.navigate({
                      name: routeName,
                      merge: true,
                    });
                  }
                },
              })
            );
          })
        ),
        _renderButtonCenter(focusedTab, navigation.navigate),
        React.createElement(
          View,
          { style: [styles.rowRight, { height: scale(height) }] },
          itemRight.map((item, index) => {
            var _a;
            const routeName =
              (_a = item === null || item === void 0 ? void 0 : item.props) ===
                null || _a === void 0
                ? void 0
                : _a.name;
            if (tabBar === undefined) {
              return renderItem({
                routeName,
                color: focusedTab === routeName ? "blue" : "gray",
                navigate: navigation.navigate,
              });
            }
            return React.createElement(
              View,
              { style: styles.flex1, key: index.toString() },
              tabBar({
                routeName,
                selectedTab: focusedTab,
                navigate: (selectTab) => {
                  if (selectTab !== focusedTab) {
                    navigation.navigate({
                      name: routeName,
                      merge: true,
                    });
                  }
                },
              })
            );
          })
        )
      )
    );
  };
  return React.createElement(
    Tab.Navigator,
    Object.assign({}, props, { tabBar: MyTabBar }),
    children === null || children === void 0
      ? void 0
      : children.map((e, index) => {
          return React.createElement(
            Tab.Screen,
            Object.assign({ key: index.toString() }, e.props)
          );
        })
  );
});
export default BottomBarComponent;
