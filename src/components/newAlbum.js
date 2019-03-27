import React, {Component} from 'react';
import {
  View,
  Modal,  
  ActivityIndicator,
  TouchableHighlight,
  AsyncStorage
} from 'react-native';
import { Content, Text, Button, Item, Icon, Input, Card, CardItem } from 'native-base';
import base_url from '../serverurl';
import Albums from './pages/Albums';

export default class Newalbum extends Component {
	constructor(props){
		super(props);
		this.state = {
		  userToken:this.props.utoken,
		  thisuserid:this.props.userid,
		  albumcaption:'',
		  newalbumload:false,
		  newalbumarray:[]
		}
	}
	createNewAlbum(){
		if(this.state.albumcaption===""){
			alert("Please enter album name" );
		}else{
			this.setState({
			  newalbumload: true
			});
			
			let data = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					acaption: this.state.albumcaption,
					user_id: this.state.thisuserid,
					user_token: this.state.userToken
				}),
			}
			fetch(base_url+'api/album/new_album', data)
			.then((response) => response.json())
			.then((responseJson) => {
				this.setState({
				  newalbumload: false
				});
				if(responseJson.status=="success"){
					//write script to show new album
					const newAlbumArr = [{
						"id": responseJson.newid,
						"caption": this.state.albumcaption,
						"countpics": "0",
						"userid": this.state.thisuserid
					}];
					this.setState({albumcaption: ""});
					Array.prototype.unshift.apply(this.state.newalbumarray, newAlbumArr);
					this.setState({newalbumarray: this.state.newalbumarray});//save all
				}else if(responseJson.status=="invalid_token"){
					alert("You cannot create album: Invalid token.");
				}else if(responseJson.status=="failure"){
					alert("Something went wrong. Please try later.");
				}
			})
			.catch((error) => {
				this.setState({
				  newalbumload: false
				});
				alert("Something went wrong: " + error.message );
			});
		}
	}
	render() {
		let newAlbumPost = <Albums userid={this.props.userid} utoken={this.props.utoken} thisuser={this.props.userid} data={this.state.newalbumarray}/>
		return (
			<Content>
				<CardItem>
					<Item success>
					<Input placeholder='Create New Photo Album' onChangeText={(text) => this.setState({albumcaption: text})}
					  value={this.state.albumcaption}/>
					<Button transparent onPress={this.createNewAlbum.bind(this)} >
						<Icon name='paper-plane'/>
					</Button>
					</Item>
				</CardItem>
				{this.state.newalbumload?<ActivityIndicator size="large"/>:<Text></Text>}
				
				<View>
					{ newAlbumPost }
				</View>
				
			</Content>
		);
	}
}

module.export = Newalbum;