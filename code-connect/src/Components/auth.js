import { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import {createUserWithEmailAndPassword, signInWithPopup, signOut} from 'firebase/auth';

export const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const sighIn = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
        }
    };

    const sighInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.log(error);
        }
    };

    const signout = async () => {
        try {
            await auth.signOut(auth);
        } catch (error) {
            console.log(error);
        }
    }



    return (
        <div> 
            <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={sighIn}>Sign In</button>
            <button onClick={sighInWithGoogle}>Sign In with Google</button>
            <button onClick={signout}>Sign Out</button>
        </div>

    )

}