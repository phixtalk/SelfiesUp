import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  AsyncStorage,
  Image,
  Modal,
  View,
  ActivityIndicator
} from 'react-native';
import { ListItem, List, Text, Icon, Left, Body, Right, Badge, ActionSheet, Button, Container, Content, Form, Input } from 'native-base';

import {Actions} from 'react-native-router-flux';
import base_url from '../../serverurl';
var ImagePicker = require('react-native-image-picker');

var BUTTONS = [
  { text: "See Album Pictures", icon: "images", iconColor: "#2c8ef4" },
  { text: "Upload New Picture", icon: "camera", iconColor: "#f42ced" },
  { text: "Cancel", icon: "close", iconColor: "#25de5b" }
];
//var DESTRUCTIVE_INDEX = 3;
var CANCEL_INDEX = 2;

export default class Albums extends Component {
	constructor(props){
		super(props);
		this.state = {
			userToken:this.props.utoken,
			userid:this.props.userid,
			thisuserid:this.props.thisuser,
			loaded: false,
			
			loading: false,
			modalVisible: false,
			selfieTitle: '',
			albumid: ''
		}
	}
	
	setModalVisible(visible) { 
		this.setState({modalVisible: visible}); 
	}
	goToGallery(albumid,modaltitle,cntpic,userid){
		AsyncStorage.setItem('pageid', this.props.thisuser);
		AsyncStorage.setItem('albumname', modaltitle);
		AsyncStorage.setItem('albumid', albumid);
		AsyncStorage.setItem('albumcount', cntpic);
		Actions.Photos();
	}
	onPress = (albumid,modaltitle,cntpic,userid,index) => {
		if(this.props.userid==this.props.thisuser){//show current user options
			ActionSheet.show(
			  {
				options: BUTTONS,
				cancelButtonIndex: CANCEL_INDEX,
				title: "Album Options"
			  },
			  buttonIndex => {
				if(buttonIndex==0){
					this.goToGallery(albumid,modaltitle,cntpic,userid) 
				}else if(buttonIndex==1){//set modal to true and albumid
					this.setState({albumid: albumid});
					this.setModalVisible(true);
				  }
			  }
			)
		}else{
			this.goToGallery(albumid,modaltitle,cntpic,userid)
		}
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
			  loading: true
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
			body.append('albumid', this.state.albumid);
			
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
				  loading: false
				});
				if(responseJson.status=="success"){
					//nothing for now
				}else if(responseJson.status=="invalid_token"){
					alert("You cannot upload picture: Invalid token.");
				}else{
					alert(responseJson.status)
				}
				this.setModalVisible(!this.state.modalVisible);
			})
			.catch((error) => {
				this.setState({
				  loading: false
				});
				alert("Something went wrong: " + error.message );
			});
		  }//end of else condition
		});
	}
	
	renderItems(itemData,index) {
		return (
			<ListItem icon key={itemData.id} onPress={() => this.onPress(itemData.id,itemData.caption,itemData.countpics,itemData.userid,index)}>
				<Left>
					<Icon name="images" />
				</Left>
				<Body>
					<Text>{itemData.caption}</Text>
				</Body>
				<Right>
					<Badge success>
						<Text>{itemData.countpics}</Text>
					</Badge>
				</Right>
			</ListItem>
		)
	}
	renderListItems = () => {
		return this.props.data.map((p,index) => (
			this.renderItems(p,index)
		))
	}
	
	render() {
		return (
			<List>
				{this.renderListItems()}
				
				
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
								
								<View>{this.state.loading ? <ActivityIndicator size="large"/> :<Text></Text>}</View>
								
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
				
			</List>
		);
	}
}
AppRegistry.registerComponent('Albums', () => Albums);