import React, { Component } from "react";
import { View, Image, Text, FlatList, ActivityIndicator, AsyncStorage, TouchableHighlight } from "react-native";
import { Item, Icon, Input, Button, List, ListItem, SearchBar, Container, Header, Content, Card, CardItem, Thumbnail, Left, Body, Right} from "native-base";

import {Actions} from 'react-native-router-flux';
import Uploadselfie from '../uploadSelfie';
import base_url from '../../serverurl';
		  
class Feed extends Component {
	constructor(props,context) {
		super(props,context);
		//this.renderHeader = this.renderHeader.bind(this);
		this.state = {
		loading: false,
		data: [],
		page: 1,
		seed: 1,
		error: null,
		refreshing: false,

		userid: '',
		userToken: ''
		};
	}
	
	componentWillMount(){
		AsyncStorage.multiGet(['id_token', 'userid']).then((data) => {
			let idtoken = data[0][1];
			let useridd = data[1][1];
			this.setState({
				userid:useridd,
				userToken: idtoken
			});
			this.makeRemoteRequest();
		});
	}
	makeRemoteRequest = () => {
		const { page, seed } = this.state;
		this.setState({ loading: true });
		let userdata = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				q_mode: this.props.dpmode,
				user_id: this.state.userid,
				user_token: this.state.userToken,
				seed: seed,
				page: page
			}),
		}
		fetch(base_url+'api/feeddata', userdata)
		  .then(res => res.json())
		  .then(res => {
			this.setState({
			  data: page === 1 ? res.feed : [...this.state.data, ...res.feed],
			  error: null,
			  loading: false,
			  refreshing: false
			});
		  })
		.catch(error => {
			this.setState({ error, loading: false });
			alert(error.message);
		});
	};
	
	gotoProfile = (uid,uname,ustatus,upic) => {
		AsyncStorage.setItem('thisuserid',uid);
		AsyncStorage.setItem('thisusernames', uname);
		AsyncStorage.setItem('thisuserstatus', ustatus);
		AsyncStorage.setItem('thisuserphoto', upic);
		if(upic===null||upic==""){
			AsyncStorage.setItem('thisuserphoto', '');
		}
		Actions.Page();
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
	handleAction = (sid,mode,thisuser,thistoken,useraction) => {
		let data = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_id: thisuser,
				user_token: thistoken,
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
	
	handleRefresh = () => {
		this.setState(
		  {
			page: 1,
			seed: this.state.seed + 1,
			refreshing: true
		  },
		  () => {
			this.makeRemoteRequest();
		  }
		);
	};

	handleLoadMore = () => {
		this.setState(
		  {
			page: this.state.page + 1
		  },
		  () => {
			this.makeRemoteRequest();
		  }
		);
	};

	renderSeparator = () => {
		return (
		  <View
			style={{
			  height: 1,
			  width: "100%",
			  backgroundColor: "#CED0CE",
			  marginLeft: "0%"
			}}
		  />
		);
	};
	
	renderHeader = () => {
		return (
			<Uploadselfie albumid='1' />
		);
	};

	renderFooter = () => {
		if (!this.state.loading) return null;

		return (
		  <View
			style={{
			  paddingVertical: 20,
			  borderTopWidth: 1,
			  borderColor: "#CED0CE"
			}}
		  >
			<ActivityIndicator animating size="large" />
		  </View>
		);
	};

	_renderItem = ({item}) => ( 
		<Card>
            <CardItem>
              <Left>
				
				<TouchableHighlight onPress={() => this.gotoPicture(item.id,item.pictureurl,item.usernames,item.pictureurl,"","2")}>
					<Thumbnail source={
						item.pictureurl!=null?{uri: base_url+'assets/photos/'+item.pictureurl}:require('../../img/photos/no-image.png')
					}/>
				</TouchableHighlight>
                <Body>
                  <Text style={{fontWeight: "bold",color:"#000000"}} onPress={() => this.gotoProfile(item.userid,item.usernames,item.userstatus,item.pictureurl)}>{item.usernames}</Text>
                  <Text note>{item.userstatus}</Text>
                </Body>
              </Left>
            </CardItem>
			<TouchableHighlight onPress={() => this.gotoPicture(item.id,item.selfieurl,item.usernames,item.pictureurl,item.description,"1")}>
				<CardItem cardBody>
				  <Image source={{uri: base_url+'assets/selfies/'+item.selfieurl}} style={{height: 200, width: null, flex: 1}}/>
				</CardItem>
			</TouchableHighlight >
			<CardItem>
			  <Body>
				<Text style={{fontWeight: "bold"}}>{item.description}</Text>
			  </Body>
			</CardItem>
            <CardItem>
              <Left>
				<Button key={"btnhype"+item.id} transparent onPress={() => this.handleAction(item.id,"1",this.state.userid,this.state.userToken,item.havehype==null?"1":"2")}>
				  <Icon name="heart" style={{ color: item.havehype!=null?"#ED4A6A":"#000000" }} />
				  <Text key={"txthype"+item.id}>{item.counthype} Hypes</Text>
				</Button>
              </Left>
              <Left>
                <Button key={"btncast"+item.id} transparent onPress={() => this.handleAction(item.id,"2",this.state.userid,this.state.userToken,item.havecast==null?"1":"2")}>
				  <Icon active name="thumbs-down" style={{ color: item.havecast!=null?"#007AFF":"#000000" }} />
				  <Text key={"txtcast"+item.id}>{item.countcast} Casts</Text>
				</Button>
              </Left>
              <Right>
				<TouchableHighlight>
					<Text key={"txtview"+item.id} style={{color:"#007AFF"}}>{item.viewcount} Views</Text>
				</TouchableHighlight>
			  </Right>
            </CardItem>
		</Card>
	);
	
	render() {
		return (
			<List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
				<FlatList
				  data={this.state.data}
				  renderItem={this._renderItem}
				  keyExtractor={item => item.id}
				  ItemSeparatorComponent={this.renderSeparator}
				  ListHeaderComponent={this.renderHeader}
				  ListFooterComponent={this.renderFooter.bind(this)}
				  onRefresh={this.handleRefresh}
				  refreshing={this.state.refreshing}
				  onEndReached={this.handleLoadMore}
				  onEndReachedThreshold={1}
				/>
			  </List>
		);
	}
}

export default Feed;
