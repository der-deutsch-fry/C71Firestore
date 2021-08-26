import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import BookTransactionScreen from './screens/BookTransactionScreen';
import SearchScreen from './screens/SearchScreen';
import {createBottomTabNavigator} from 'react-navigation-tabs'
import {createAppContainer} from 'react-navigation'

export default class App extends React.Component {
  render(){
  return (
    <AppContainer></AppContainer>
  );
}}

const TabNavigator = createBottomTabNavigator({
  BookTransactionScreen:{screen:BookTransactionScreen},
  SearchScreen:{screen:SearchScreen}
},
{defaultNavigationOptions:({navigation})=>({
  tabBarIcon:({})=>{
    const routeName=navigation.state.routeName
    if(routeName==='BookTransactionScreen'){
      return(
        <Image source={require('./assets/book.png')}
        style={{width:40, height:40}}
        />
      )
    }
    else if(routeName==='SearchScreen'){
      return(
        <Image source={require('./assets/searchingbook.png')}
        style={{width:40, height:40}}
        />
      )
    }
  }
})
}
)

const AppContainer = createAppContainer(TabNavigator)
