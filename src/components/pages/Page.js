import React, { Component } from 'react';
import { StyleSheet, Image, AppRegistry, AsyncStorage, TouchableHighlight, ActivityIndicator } from 'react-native';
import { Content, View, Card, CardItem, Thumbnail, Text, Left, Body, Button } from 'native-base';
import {Actions} from 'react-native-router-flux';

import base_url from '../../serverurl';
import Albums from './Albums';
import Newalbum from '../newAlbum';

export default class Page extends Component {
	
	constructor(props){
		super(props);
		this.state = {
		  userToken:'',
		  currentuserid:'',
		  thisusername:'',
		  thisuserid:'',
		  thisuserstatus: '',
		  thisuserphoto: '',
		  mypage:false,
		  loaded: false,
		  loadedalbum:false,
		  currentalbum:'',
		  albumdata: []
		}
	}
	componentWillMount(){
		AsyncStorage.multiGet(['id_token', 'usernames', 'userid', 'status', 'thisusernames', 'thisuserid', 'thisuserstatus','userpicture','thisuserphoto']).then((data) => {
			let idtoken = data[0][1];
			let currentuser = data[2][1]
			let usename = this.props.ownerpage==="true" ? data[1][1] : data[4][1];
			let userid = this.props.ownerpage==="true" ? data[2][1] : data[5][1];
			let ustatus = this.props.ownerpage==="true" ? data[3][1] : data[6][1];
			let dbpic = this.props.ownerpage==="true" ? data[7][1] : data[8][1];
			let userpage = this.props.ownerpage==="true" ? true : false;
			
			if(this.props.ownerpage==="true"){//delete previous keys of previous view
				let prevkeys = ['thisusernames', 'thisuserid', 'thisuserstatus','thisuserphoto'];
				AsyncStorage.multiRemove(prevkeys, (err) => {});	
			}
			
			this.setState({
				userToken:idtoken,
				currentuserid:currentuser,
				thisusername:usename,
				thisuserid:userid,
				thisuserstatus: ustatus,
				thisuserphoto: dbpic,
				mypage:userpage,
				loaded: true
			});	
			this.getAlbumData();
		});
	}
	gotoPicture = (uid,upic,uname,profilepic,picdescribe,picmode) => {
		AsyncStorage.setItem('pictureid',uid);
		AsyncStorage.setItem('pictureurl', upic);
		AsyncStorage.setItem('ownername', uname);
		AsyncStorage.setItem('ownerpic', profilepic);
		AsyncStorage.setItem('picdescription', picdescribe);
		AsyncStorage.setItem('picmode', picmode);
		if(profilepic===null||profilepic==""){
			AsyncStorage.setItem('ownerpic', '');
		}
		if(picmode==1){
			Actions.Picture();
		}else{//profile picture
			if(profilepic===null||profilepic==""){
			}else{
				Actions.Picture();
			}
		}
	}
	getAlbumData() {
		let userdata = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_id: this.state.currentuserid,
				user_token: this.state.userToken,
				thisuser: this.state.thisuserid
			}),
		}
		fetch(base_url+'api/album', userdata)
		.then((response) => response.json())
		.then((responseJson) => {
			if(responseJson.status=="success"){
				this.setState({loadedalbum: true});
				this.setState({albumdata: responseJson.feed});
			}else if(responseJson.status=="invalid_token"){
				alert("You cannot view feed: Invalid token.");
			}else if(responseJson.status=="empty"){
				//display empty page
			}
		})
		.catch((error) => {
			this.setState({loaded: false});
			alert("Something went wrong: " + error.message );
		});
	}
	
  render() {
		let shownewalbum = this.state.mypage?<Newalbum userid={this.state.currentuserid} utoken={this.state.userToken} thisuser={this.state.thisuserid} />:<Text></Text>
		
		//let pagestyle = this.state.thisuserid!==this.state.currentuserid?
		
		let userpage = this.state.loaded?
			<Card>
				<CardItem>
				  <Left>
					<TouchableHighlight onPress={() => this.gotoPicture("0",this.state.thisuserphoto,this.state.thisusername,this.state.thisuserphoto,"","2")}>
					<Thumbnail source={
						this.state.thisuserphoto===null||this.state.thisuserphoto==""?
						require('../../img/photos/no-image.png')
						:
						{uri: base_url+'assets/photos/'+this.state.thisuserphoto}
						}/>
					</TouchableHighlight>
					<Body>
					  <Text>{this.state.thisusername}</Text>
					  <Text note>{this.state.thisuserstatus}</Text>
					</Body>
				  </Left>
				</CardItem>
				{shownewalbum}
			</Card>
			:
			<ActivityIndicator size="large"/>
		return (
			<Content style={this.props.ownerpage==="true"?styles.nomargin:styles.addmargin}>
				
				{userpage}
				
				<View>
					{this.state.loadedalbum?<Albums userid={this.state.currentuserid} utoken={this.state.userToken} thisuser={this.state.thisuserid} data={this.state.albumdata}/>:<ActivityIndicator size="large"/>}
				</View>
				
			</Content>
			
		);
	}
}
const styles = StyleSheet.create({
  addmargin: {
	  marginTop: 55
  },
  nomargin: {
    marginTop: 0
  },
});
AppRegistry.registerComponent('Page', () => Page);