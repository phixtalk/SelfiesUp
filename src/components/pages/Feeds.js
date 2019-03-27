import React, { Component } from "react";
import { View, Image, Text, FlatList, Modal, ActivityIndicator, AsyncStorage, TouchableHighlight, InteractionManager } from "react-native";
import { Icon, Input, Button, List, ListItem, SearchBar, Container, Header, Content, Card, CardItem, Thumbnail, Left, Body, Right, Form} from "native-base";

import {Actions} from 'react-native-router-flux';
//import Uploadselfie from '../uploadSelfie';
import base_url from '../../serverurl';

var ImagePicker = require('react-native-image-picker');
		  
class Feeds extends Component {
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
		userToken: '',
		username:'',
		userstatus:'',
		userphoto:'',
		loadupload: false,
		modalVisible: false,
		selfieTitle: '',
		newphotoarray:[]
		};
	}
	
	componentWillMount(){
		AsyncStorage.multiGet(['id_token', 'userid', 'usernames', 'status', 'userpicture']).then((data) => {
			let idtoken = data[0][1];
			let useridd = data[1][1];
			let username = data[2][1];
			let userstatus = data[3][1];
			let userphoto = data[4][1];
			this.setState({
				userid:useridd,
				userToken: idtoken,
				username:username,
				userstatus:userstatus,
				userphoto:userphoto
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
	setModalVisible(visible) { 
		this.setState({modalVisible: visible}); 
	}
	
	handleNewSelfie(){
		var options = {
		  title: 'Select Picture',
		  storageOptions: {
			skipBackup: true,
			path: 'Pictures'
		  }
		};
		ImagePicker.showImagePicker(options, (response) => {
		  console.log('Response = ', response);
		  if (response.didCancel) {
			//console.log('User cancelled image picker');
		  }else if (response.error) {
			//console.log('ImagePicker Error: ', response.error);
		  }else if (response.customButton) {
			//console.log('User tapped custom button: ', response.customButton);
		  }else {//upload to server
			this.setState({
			  loadupload: true
			});
			
			let source = { uri: response.uri };
			//let source2 = { uri: 'data:image/jpeg;base64,' + response.data };
			const file = {
				uri: response.uri,
				type: response.type,
				name: response.fileName
			}
			const body = new FormData()
			body.append('userfile', file);
			body.append('utoken', this.state.userToken);
			body.append('userid', this.state.userid);
			body.append('caption', this.state.selfieTitle);
			body.append('albumid', "1");
			
			fetch(base_url + 'api/selfieupload', {
				method: 'POST',
				body,
				headers: {
				  'Content-Type': 'multipart/form-data',
				  'Authorization': 'Bearer ' + this.state.userToken
				}
			})
			.then((response) => response.json())
			.then(responseJson => {
				this.setState({
				  loadupload: false
				});
				if(responseJson.status=="success"){
					const newPicArr = [{
						"id": responseJson.newid,
						"selfieurl": responseJson.newuploadphoto,
						"userid": this.state.userid,						
						"usernames": this.state.username,
						"userstatus": this.state.userstatus,
						"pictureurl": this.state.userphoto,
						"description": this.state.selfieTitle,
						"havehype": null,
						"havecast": null,
						"counthype": "0",
						"countcast": "0",
						"viewcount": "0"
					}];
					this.setState({selfieTitle: ""});
					Array.prototype.unshift.apply(this.state.data, newPicArr);
					this.setState({data: this.state.data});//save all
				}else if(responseJson.status=="invalid_token"){
					alert("You cannot upload picture: Invalid token.");
				}else{
					alert(responseJson.status)
				}
				this.setModalVisible(!this.state.modalVisible);
			})
			.catch((error) => {
				this.setState({
				  loadupload: false
				});
				alert("Something went wrong: " + error.message );
			});
		  }//end of else condition
		});
	}
	handleAction = (sid,mode,thisuser,thistoken,useraction,index) => {
		if(mode=="1"){//for hypes
			if(useraction=="1"){//user's first hype, increase counter and set havehype
				this.state.data[index].counthype++;
				this.state.data[index].havehype = sid;
			}else{//user wants to unhype, reduce counter and reset have hype to null
				this.state.data[index].counthype--;
				this.state.data[index].havehype = null;
			}	
		}else if(mode=="2"){
			if(useraction=="1"){//user's first cast, increase counter
				this.state.data[index].countcast++;
				this.state.data[index].havecast = sid;
			}else{//user wants to uncast, reduce counter and reset have cast to null
				this.state.data[index].countcast--;
				this.state.data[index].havecast = null;
			}	
		}
		this.setState({data: this.state.data});//reset data state
		
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
		
		if (!this.onEndReachedCalledDuringMomentum) {
		  this.setState(
		  {
			page: this.state.page + 1
		  },
		  () => {
			this.makeRemoteRequest();
		  }
		);
		  this.onEndReachedCalledDuringMomentum = true;
		}
	
		
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
		if (this.props.dpmode=="2") return null;
		return (
			<View>
				<ListItem>
					<Button iconLeft transparent primary onPress={() => { this.setModalVisible(true) }}>
						<Icon name='camera' />
						<Text style={{fontWeight:'bold'}}>UPLOAD YOUR PICTURE</Text>
					</Button>
				</ListItem>
			
				<Modal animationType={"slide"} transparent={false} visible={this.state.modalVisible} onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)}} > 
					<Form>
						<View> 
							<List>
								<ListItem itemDivider>
								  <Left>
									<Text>Upload Picture</Text>
								  </Left>
								  <Right>
									<Button iconLeft transparent danger onPress={() => { this.setModalVisible(!this.state.modalVisible) }}>
										<Icon name='close-circle' />
									</Button>
								  </Right>
								</ListItem>
								
								<View>{this.state.loadupload ? <ActivityIndicator size="large"/> :<Text></Text>}</View>
								
								<ListItem>
									<Input placeholder='write picture title here' onChangeText={(text) => this.setState({selfieTitle: text})} value={this.state.selfieTitle}/>
								</ListItem>
								
								<ListItem>
									<Button iconLeft transparent success onPress={this.handleNewSelfie.bind(this)}>
										<Icon name='camera' />
										<Text>Select Picture to Upload</Text>
									</Button>
								</ListItem>
								
								<ListItem>
								  
								  
								  <Right>
									
								  </Right>
								</ListItem>
							</List>
						</View> 
					 </Form>
				</Modal> 
			
			</View>
			
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
			<ActivityIndicator size="large"/>
		  </View>
		);
	};

	callModal(){
		
	}
	//showModal(){}
	_renderItem = ({item,index}) => ( 
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
				<Button transparent onPress={() => this.handleAction(item.id,"1",this.state.userid,this.state.userToken,item.havehype==null?"1":"2",index)}>
				  <Icon name="heart" style={{ color: item.havehype!=null?"#ED4A6A":"#000000" }} />
				  <Text>{item.counthype} Hypes</Text>
				</Button>
              </Left>
              <Left>
                <Button transparent onPress={() => this.handleAction(item.id,"2",this.state.userid,this.state.userToken,item.havecast==null?"1":"2",index)}>
				  <Icon active name="thumbs-down" style={{ color: item.havecast!=null?"#007AFF":"#000000" }} />
				  <Text>{item.countcast} Casts</Text>
				</Button>
              </Left>
              <Right>
				<TouchableHighlight>
					<Text style={{color:"#007AFF"}}>{item.viewcount} Views</Text>
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
				  onEndReachedThreshold={0.5}
				  onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
				/>
			  </List>
		);
	}
}

export default Feeds;
