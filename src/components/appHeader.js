import React, {Component} from 'react';
import { Header, Text} from 'native-base';

export default class AppHeader extends Component {
  render() {
    return (
		<Header>
			<Text style={{ color: '#FFF',fontSize: 30 }}>VanityApp</Text>
		</Header>
    );
  }
}

module.export = AppHeader;