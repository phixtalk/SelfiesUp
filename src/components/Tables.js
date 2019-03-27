import React, { Component } from 'react';
import {
  AppRegistry,
  View,
  Text
} from 'react-native';

export default class Table extends Component {
    renderRow(i) {
        return (
            <View key={i} style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row' }}>
                <View style={{ flex: 1, alignSelf: 'stretch' }} ><Text>Hello</Text></View>
                <View style={{ flex: 1, alignSelf: 'stretch' }} ><Text>Hello</Text></View>
            </View>
        );
    }

    render() {
        const data = [1, 2, 3, 4, 5];
		//alert(data);
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {data.map((datum,i) => { return this.renderRow(i)})}
            </View>
        );
    }
}