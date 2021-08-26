import * as React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from "expo-permissions";
import db from '../config';
import * as firebase from 'firebase';


export default class BookTransactionScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            scannedData: '',
            buttonState: 'normal',
            scannedStudentId: '',
            scannedBookId: '',
            transactionMessage: '',
            
        }
    }
    getCameraPermissions = async (id) => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions: status === "granted",
            buttonState: id,
            scanned: false
        })
    }
    handleBarCodeScanned = async ({ type, data }) => {
        const { buttonState } = this.state
        if (buttonState === "BookId") {
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal'
            })
        }
        else if (buttonState === "StudentId") {
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'
            })
        }

    }
    initiateBookIssue = async () => {
        //adding a new collection to the db
        db.collection('transactions').add({
            "studentId": this.state.scannedStudentId,
            "bookId": this.state.scannedBookId,
            "date": firebase.firestore.Timestamp.now().toDate(),
            "transactionType": "Issue"
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            "bookAvailability": false
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            "numberOfBooksIssued": firebase.firestore.FieldValue.increment(1)
        })
        Alert.alert("Book is Successfully Issued")
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''
        })
    }

    initiateBookReturn = async () => {
        //adding a new collection to the db
        db.collection('transactions').add({
            "studentId": this.state.scannedStudentId,
            "bookId": this.state.scannedBookId,
            "date": firebase.firestore.Timestamp.now().toDate(),
            "transactionType": "Return"
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            "bookAvailability": true
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
            "numberOfBooksIssued": firebase.firestore.FieldValue.increment(-1)
        })
        Alert.alert("Book is Successfully Returned")
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''
        })
    }

    handleTransaction = async () => {
        var transactionMessage
        db.collection('books').doc(this.state.scannedBookId).get()
            .then((doc) => {
                var book = doc.data()
                if (book.bookAvailability) {
                    this.initiateBookIssue();
                    transactionMessage = "Book Issued"
                }
                else {
                    this.initiateBookReturn()
                    transactionMessage = "Book Returned"
                }
            })
        this.setState({
            transactionMessage: transactionMessage
        })
    }
    render() {
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if (buttonState !== "normal" && hasCameraPermissions) {
            return (
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            )
        }
        else if (buttonState === "normal") {
            return (
                <View style={styles.container}>
                    <View>
                        <Image source={require("../assets/booklogo.jpeg")}
                            style={{ width: 200, height: 200 }}
                        />
                        <Text style={{ textAlign: 'center', fontSize: 30 }}>WILY</Text>
                    </View>

                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Book ID"
                            value={this.state.scannedBookId}
                            onChangeText={text=>this.setState({scannedBookId:text})}
                        />
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={() => { this.getCameraPermissions("BookId") }}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Student ID"
                            value={this.state.scannedStudentId}
                            onChangeText={text=>this.setState({scannedStudentId:text})}
                        />
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={() => { this.getCameraPermissions("StudentId") }}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.submitButton} onPress={async () => { this.handleTransaction() }}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButton: {
        backgroundColor: 'red',
        width: 50,
        borderWidth: 1.5,
        borderLeftWidth: 0
    },
    buttonText: {
        fontSize: 20,
        color: 'white'
    },
    inputView: {
        flexDirection: 'row',
        margin: 20,
    },
    inputBox: {
        width: 200,
        height: 40,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20
    },
    submitButton: {
        backgroundColor: '#FBC02D',
        width: 100,
        height: 50,
    },
    submitButtonText: {
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: "bold",
        color: 'white'
    }
})