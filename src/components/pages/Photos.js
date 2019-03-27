import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  AsyncStorage,
  ActivityIndicator,
  TouchableHighlight
} from 'react-native';
import {Actions} from 'react-native-router-flux';
//import Page from './Page';
import base_url from '../../serverurl';
import FitImage from 'react-native-fit-image';

import { ListItem, List, Content, DeckSwiper, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Badge, Container, Header } from 'native-base';

//import Uploadselfie from '../uploadSelfie';

export default class Photos extends Component {
	
	constructor(props){
		super(props);
		this.state = {
			userToken:'',
			userid:'',
			pageid:'',
			loadphotos:false,
			loadupload:false,
			photodata:[],
			albumname:'',
			albumid:'',
			albumcount:''
		}
	}
	
	componentWillMount(){
		AsyncStorage.multiGet(['id_token', 'userid', 'pageid', 'albumname', 'albumid', 'albumcount']).then((data) => {
			let idtoken = data[0][1];
			let userid = data[1][1];
			let pageid = data[2][1];
			let albumname = data[3][1];
			let albumid = data[4][1];
			let albumcount = data[5][1];
			
			this.setState({
				userToken:idtoken,
				userid:userid,
				pageid:pageid,
				albumname:albumname,
				albumid:albumid,
				albumcount:albumcount,
				loadupload:true
			});
			if(albumcount>0){
				this.getAlbumPhotos();
			}else{//dont bother connecting to db if there is no pic
				this.setState({loadphotos: true});
			}
		});
	}
	gotoPicture = (uid,upic,uname,profilepic,picdescribe) => {
		AsyncStorage.setItem('pictureid',uid);
		AsyncStorage.setItem('pictureurl', upic);
		AsyncStorage.setItem('ownername', uname);
		AsyncStorage.setItem('ownerpic', profilepic);
		AsyncStorage.setItem('picdescription', picdescribe);
		if(profilepic===null||profilepic==""){
			AsyncStorage.setItem('ownerpic', '');
		}
		Actions.Picture();
	}
	getAlbumPhotos(){
		let userdata = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				albumid: this.state.albumid,
				user_id: this.state.userid,
				user_token: this.state.userToken,
				pageowner: this.state.pageid
			}),
		}
		fetch(base_url+'api/photos', userdata)
		.then((response) => response.json())
		.then((responseJson) => {
			if(responseJson.status=="success"){
				this.setState({photodata: responseJson.feed});
				this.setState({loadphotos: true});				
			}else if(responseJson.status=="invalid_token"){
				alert("You cannot view feed: Invalid token.");
			}else if(responseJson.status=="empty"){
				//display empty page
			}
		})
		.catch((error) => {
			//this.setState({loaded: false});
			alert("Something went wrong: " + error.message );
		});
	}
	handleAction = (sid,mode,useraction) => {
		let data = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_id: this.state.userid,
				user_token: this.state.userToken,
				selfieid: sid,
				actionmode: mode,
				uaction: useraction
			}),
		}
		fetch(base_url+'api/feedaction', data)
		.then((response) => response.json())
		.then((responseJson) => {
			if(responseJson.status=="success"){
				
			}else if(responseJson.status=="invalid_token"){
				alert("You cannot update status: Invalid token.");
			}else if(responseJson.status=="failure"){
				alert("Something went wrong. Please try later.");
			}
		})
		.catch((error) => {
			alert("Something went wrong: " + error.message );
		});
	}
	render() {
		
		let nextbutton = this.state.albumcount > 0 ?
			
			<View style={{ flexDirection: "row", flex: 1, position: "absolute", bottom: 7, left: 0, right: 0, justifyContent: 'space-between', padding: 15 }}>
				  <Button iconLeft onPress={() => this._deckSwiper._root.swipeLeft()}>
					<Icon name="arrow-back" />
					<Text>Swipe Left</Text>
				  </Button>
				  <Button iconRight onPress={() => this._deckSwiper._root.swipeRight()}>
					<Text>Swipe Right</Text>
					<Icon name="arrow-forward" />
				  </Button>
				</View>
				
			:
				<View></View>
		
		let photopage = this.state.loadphotos?
			<View>
				<View>
				  <DeckSwiper
					ref={(c) => this._deckSwiper = c}
					dataSource={this.state.photodata}
					renderEmpty={() =>
					  <View style={{ alignSelf: "center" }}>
						<Text>No pictures</Text>
					  </View>
					  }
					renderItem={item =>
					  <Card style={{ elevation: 3 }}>
						<CardItem>
						  <Left>
								<Thumbnail source={
									item.pictureurl!=null?{uri: base_url+'assets/photos/'+item.pictureurl}:require('../../img/photos/no-image.png')
									}/>
							<Body>
							  <Text>{item.usernames}</Text>
							  <Text note>{item.description}</Text>
							</Body>
						  </Left>
						</CardItem>
						<TouchableHighlight onPress={() => this.gotoPicture(item.id,item.selfieurl,item.usernames,item.pictureurl,item.description)}>
							<CardItem cardBody>
								<FitImage
								  source={{ uri: base_url+'assets/selfies/'+item.selfieurl }}
								  style={{borderRadius: 20}}
								/>
							</CardItem>
						</TouchableHighlight>
						<CardItem>
						  <Left>
							<Button key={"btnhype"+item.id} transparent onPress={() => this.handleAction(item.id,"1",item.havehype==null?"1":"2")}>
							  <Icon name="heart" style={{ color: item.havehype!=null?"#ED4A6A":"#000000" }} />
							  <Text key={"txthype"+item.id}>{item.counthype} Hypes</Text>
							</Button>
						  </Left>
						  <Left>
							<Button key={"btncast"+item.id} transparent onPress={() => this.handleAction(item.id,"2",item.havecast==null?"1":"2")}>
							  <Icon active name="thumbs-down" style={{ color: item.havecast!=null?"#007AFF":"#000000" }} />
							  <Text key={"txtcast"+item.id}>{item.countcast} Casts</Text>
							</Button>
						  </Left>
						  <Left>
							<Icon active name="eye" style={{ color: "#007AFF"}} />
							<Text key={"txtview"+item.id}>{item.viewcount} Views</Text>
						  </Left>
						</CardItem>
				
					  </Card>
					}
				  />
				</View>
				
				
				
			</View>
			:
			<ActivityIndicator size="large"/>
			
		//let showUpload = this.state.loadupload&&this.state.userid===this.state.pageid?<Uploadselfie albumid={this.state.albumid} />:<View></View>
		/*
		{nextbutton}
		*/
	
			
    return (
		<Container style={{marginTop:60}}>
			{photopage}
		</Container>
    );
  }
}
AppRegistry.registerComponent('Photos', () => Photos);
