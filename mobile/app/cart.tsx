import { Link } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
export default function Cart(){return <View style={styles.container}><Text accessibilityRole="header" style={styles.heading}>Cart</Text><Text>Your server cart appears here after sign-in. Guest cart sync is intentionally not treated as authoritative offline.</Text><Link href="/checkout" asChild><Pressable accessibilityRole="button" style={styles.button}><Text>Checkout</Text></Pressable></Link></View>}
const styles=StyleSheet.create({container:{flex:1,padding:24,gap:16},heading:{fontSize:28,fontWeight:'700'},button:{backgroundColor:'#b8892b',padding:14,borderRadius:24,alignItems:'center'}});
