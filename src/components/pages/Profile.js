import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  AsyncStorage,
  Image,
  View,
  Modal,  
  TouchableHighlight,
  ActivityIndicator
} from 'react-native';
import { Container, Header, Content, List, ListItem, Separator, Thumbnail, Text, Button, Icon, Left, Body, Right, Item, Input, Form } from 'native-base';

import {Actions} from 'react-native-router-flux';
import base_url from '../../serverurl';
import {ContentSnippet, GetImage} from '../../helpers/helpers';

var ImagePicker = require('react-native-image-picker');

export default class Profile extends Component {
	
	constructor(props){
		super(props);
		this.state = {
		  uemail: '',
		  ustatus: '',
		  unames:'',
		  userToken:'',
		  dbphoto:'',
		  userid:'',
		  loaded: false,
		  loading: false,
		  modalVisible: false,
		  newStatus: ''
		}
	}

	componentWillMount(){
		AsyncStorage.multiGet(['id_token', 'usernames', 'email', 'status', 'userid', 'userpicture']).then((data) => {
			let idtoken = data[0][1];
			let usename = data[1][1];
			let email = data[2][1];
			let cstatus = data[3][1];
			let useridd = data[4][1];
			let dbpic = data[5][1];
			
			//for now, until we start saving pic in asyncStorage
			//alert(dbpic);
			
			if(idtoken !== null){
				this.setState({
					uemail: email,
					ustatus: cstatus,
					unames:usename,
					userToken: idtoken,
					userid:useridd,
					loading: false,
					loaded: true,
					newStatus: cstatus,
					dbphoto:dbpic,
				});
			}else{
				Actions.Login();
			}
		});
	}
	
	setModalVisible(visible) { 
		this.setState({modalVisible: visible}); 
	}
	
	updateStatus() {
		if(this.state.newStatus===""){
			alert("Please enter your new status" );
		}else{
			this.setState({
			  loading: true
			});
			
			let data = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					new_status: this.state.newStatus,
					user_id: this.state.userid,
					user_token: this.state.userToken
				}),
			}
			fetch(base_url+'api/updatestatus', data)
			.then((response) => response.json())
			.then((responseJson) => {
				this.setState({
				  ustatus: this.state.newStatus,
				  loading: false
				});
				if(responseJson.status=="success"){
					AsyncStorage.setItem('status', this.state.newStatus);
					this.setModalVisible(!this.state.modalVisible);
				}else if(responseJson.status=="invalid_token"){
					alert("You cannot update status: Invalid token.");
				}else if(responseJson.status=="failure"){
					alert("Something went wrong. Please try later.");
				}
			})
			.catch((error) => {
				this.setState({
				  loading: false
				});
				alert("Something went wrong: " + error.message );
			});
		}
	}
	
	callPictureSelector(){
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
			body.append('profilephoto', this.state.userid);
			body.append('db_picture', this.state.dbphoto);
			
			fetch(base_url + 'api/profilepicture', {
				method: 'POST',
				body,
				headers: {
				  'Content-Type': 'multipart/form-data',
				  'Authorization': 'Bearer ' + this.state.userToken
				}
			})
			.then((response) => response.json())
			.then(responseJson => {
				if(responseJson.status=="success"){
					this.setState({
					  dbphoto: responseJson.newpictureurl,
					  loading: false
					});
					AsyncStorage.setItem('userpicture', responseJson.newpictureurl);
				}else{
					alert(responseJson.status)
				}
			}).catch(err => {
				alert("Something went wrong.")
			});
		  }//end of else condition
		});
	}

	render() {
		
		let userpage = this.state.loaded?
			
			<List>
				<ListItem style={{justifyContent: 'center',alignItems: 'center',}}>
					
					<Thumbnail large 
						
						source={
							this.state.dbphoto==null||this.state.dbphoto==""?require('../../img/photos/no-image.png'):{uri: base_url+'assets/photos/'+this.state.dbphoto}
						}
					/>
					
					<View>{this.state.loading ? <ActivityIndicator size="large"/> :<Text></Text>}</View>
					
					<Button iconLeft transparent primary onPress={this.callPictureSelector.bind(this)}>
						<Icon name='camera' />
					</Button>
					 
				</ListItem>
				<ListItem icon>
				  <Left>
					<Icon name="person" />
				  </Left>
				  <Body>
					<Text>{this.state.unames}</Text>
				  </Body>
				</ListItem>
				
				<ListItem icon>
				  <Body>
					<Text>{this.state.ustatus}</Text>
				  </Body>
				  <Left>
				  
				  <TouchableHighlight onPress={() => { this.setModalVisible(true) }}> 
					<Icon name="create" />
				  </TouchableHighlight>
					
				  </Left>
				</ListItem>
				
				<Separator bordered>
					 
				</Separator>
				
				<ListItem>
					
				</ListItem>
				
			</List>
		:
			<ActivityIndicator size="large"/>
			
			
		return (
			<Content>
				
				{userpage}
				
				<Modal animationType={"slide"} transparent={false} visible={this.state.modalVisible} onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)}} > 
					<Form>
						<View> 
							<List>
								<ListItem itemDivider>
								  <Text>Update Your Status</Text>
								</ListItem> 
								
								<View>{this.state.loading ? <ActivityIndicator size="large"/> :<Text></Text>}</View>
								
								<ListItem>
								  <Item success>
									<Input placeholder='your status' onChangeText={(text) => this.setState({newStatus: text})} value={this.state.newStatus}/>
									<Icon name='checkmark-circle' />
								  </Item>
								</ListItem>
								
								<ListItem>
								  
								  <Left>
									<Button iconLeft transparent danger onPress={() => { this.setModalVisible(!this.state.modalVisible) }}>
										<Text>Cancel</Text>
									</Button>
								  </Left>
								  <Right>
									<Button iconLeft transparent success onPress={this.updateStatus.bind(this)}>
										<Text>OK</Text>
									</Button>
								  </Right>
								</ListItem>
							</List>
						</View> 
					 </Form>
				</Modal> 
				
				<ListItem>
					<Button full danger style={{ marginTop: 40,marginBottom: 20 }} onPress={this.logout.bind(this)}>
						<Text style={{ color: '#FFF', fontWeight:'bold' }}>Logout</Text>
					</Button>
				</ListItem>
				
					
			</Content>
		);
	}
	logout(){
		let keys = ['id_token', 'usernames', 'email', 'status', 'userid', 'userpicture'];
		AsyncStorage.multiRemove(keys, (err) => {
		  Actions.Login();
		});
	}
}

AppRegistry.registerComponent('Profile', () => Profile);