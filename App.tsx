import React from 'react';

import {StyleSheet, ScrollView, Text, View, Button} from 'react-native';

import Amplify, { Auth, Analytics } from 'aws-amplify';
import PushNotification from '@aws-amplify/pushnotification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import awsmobile from './aws-exports';



export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      status: 'status',
        data: 'data'
    };
    this.onPressEventTrigger = this.onPressEventTrigger.bind(this);
  }

  componentDidMount(): void {
      Amplify.configure({
          Analytics: {
              AWSPinpoint: {
                  appId: awsmobile.aws_mobile_analytics_app_id,
                  region: awsmobile.aws_mobile_analytics_app_region,
              }
          },
      })
      Auth.configure(awsmobile);
      PushNotification.configure({
          appId: awsmobile.pinpoint_app_id
      });

      PushNotification.onRegister((token) => {
          console.log('in app registration', token);
          Analytics.updateEndpoint({
              address: token,
          });
          this.setState({status: 'Registered for Push Notification',
                                data: 'Device Token: ' + token
          });
      });

      PushNotification.onNotification((notification) => {
          console.log('in app notification', notification);

          notification.finish(PushNotificationIOS.FetchResult.NoData);
          this.setState({status: 'notification received',
                                data: JSON.stringify(notification, null, 4)
          });
      });

      const currentConfig = Auth.configure();
      console.log('currentConfig =>' + JSON.stringify(currentConfig, null, 4));
      Amplify.Logger.LOG_LEVEL = 'DEBUG'
  }

  onPressEventTrigger() {
      Analytics.record({ name: 'campaignTrigger' });
      this.setState({status: 'Sent Event Trigger: ',
          data: 'campaignTrigger'
      });
  }

  render() {
    return (
        <View style={{flex: 1, paddingTop: 44}}>
            <ScrollView contentContainerStyle={styles.container}>
              <Text>{this.state.status}</Text>
                <Text> {this.state.data}</Text>
                <Button
                    onPress={this.onPressEventTrigger}
                    title="Send event: campaignTrigger"
                    color="#841584"
                    accessibilityLabel="Send event: campaignTrigger"
                />
            </ScrollView>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-around',
    backgroundColor: '#F5FCFF',
    padding: 10
  }
})

