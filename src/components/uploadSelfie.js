import React, {Component} from 'react';
import {
  View,
  Modal,  
  ActivityIndicator,
  TouchableHighlight,
  AsyncStorage
} from 'react-native';
import { Header, Content, List, ListItem, Text, Button, Icon, Left, Body, Right, Item, Input, Form } from 'native-base';
import base_url from '../serverurl';
import Feed from './pages/Feed';

var ImagePicker = require('react-native-image-picker');

export default class Uploadselfie extends Component {
	constructor(props){
		super(props);
		this.state = {
		  loading: false,
		  modalVisible: false,
		  selfieTitle: '',
		  userToken: '',
		  userid: '',
		  username:'',
		  userstatus:'',
		  userphoto:'',
		  newphotoarray:[]
		}
	}
	componentWillMount(){
		AsyncStorage.multiGet(['id_token', 'userid', 'usernames', 'status', 'userpicture']).then((data) => {
			let idtoken = data[0][1];
			let useridd = data[1][1];
			let username = data[2][1];
			let userstatus = data[3][1];
			let userphoto = data[4][1];
			if(idtoken !== null){
				this.setState({
					userToken: idtoken,
					userid:useridd,
					username:username,
					userstatus:userstatus,
					userphoto:userphoto
				});
			}else{
				Actions.Login();
			}
		});
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
			body.append('albumid', this.props.albumid);
			
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
					Array.prototype.unshift.apply(this.state.newphotoarray, newPicArr);
					this.setState({newphotoarray: this.state.newphotoarray});//save all
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
	
	render() {
		let newPictureUpload = <Feed userid={this.state.userid} utoken={this.state.userToken} data={this.state.newphotoarray}/>
		
		return (
			<Content>
				<ListItem>
					<Button iconLeft transparent primary onPress={() => { this.setModalVisible(true) }}>
						<Icon name='camera' />
						<Text>Upload Your Picture</Text>
					</Button>
				</ListItem>
				
				<View>
					{ newPictureUpload }
				</View>
				
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
								  <Item success>
									<Input placeholder='give your picture a title' onChangeText={(text) => this.setState({selfieTitle: text})} value={this.state.selfieTitle}/>
								  </Item>
								</ListItem>
								
								<ListItem>
								  <Item success>
									<Button iconLeft transparent success onPress={this.handleNewSelfie.bind(this)}>
										<Icon name='camera' />
										<Text>Select Picture to Upload</Text>
									</Button>
								  </Item>
								</ListItem>
								
								<ListItem>
								  
								  
								  <Right>
									
								  </Right>
								</ListItem>
							</List>
						</View> 
					 </Form>
				</Modal> 
			</Content>
		);
	}
}

module.export = Uploadselfie;