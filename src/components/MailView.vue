<template>
    <div class='email-display'>
        <div> 
            <div> 
                <button v-if="showPrevious" @click="getPreviousEmail">&lt; Previous</button> 
                <button @click="toggleRead">{{ email.read ?  'Mark As Unread (r)': 'Mark As Read (r)'  }}</button> 
                <button @click="toggleArchived">{{email.archived ? 'Un-archive (e)' : 'Archive (e)'}}</button> 
                <button v-if="showNext" @click="getNextEmail">Next &gt;</button> 
             </div>
        </div>
        
        <h2 class='mb-0'> Subject: <strong> {{email.subject}} </strong> </h2>
        <div> <em> From {{email.from}} on {{email.sent}} </em></div>
        <div v-html="marked(email.body)"/>
    </div>
</template>
<script>
import { format } from 'date-fns';
import  marked from 'marked';
import  axios  from 'axios';
import useKeydown from '../composables/use-keydown'
export default {
    setup(props, {emit}){
        let email = props.email;
        let showNext = props.showNext;
        let showPrevious = props.showPrevious;
        // let toggleRead = (e) => {
        //     e.preventDefault();
        //     email.read = !email.read;
        //     updateEmail();
        // }
        // let toggleArchived = () => {
        //     email.archived = !email.archived
        //     updateEmail()

        // }
        let toggleRead = () => {emit('changeEmail', {toggleRead: true, save:true})}
        let toggleArchived = () => 
                {emit('changeEmail', {toggleArchived: true, save:true, closeModal: true})}

        let updateEmail = () => {
            axios.put(`http://localhost:3000/emails/${email.id}`, email)
            console.log('sent')
        }
        let getNextEmail = () => {
            {emit('changeEmail', {changeIndex: 1})}
        }

        let getPreviousEmail = () => {
            {emit('changeEmail', {changeIndex: -1})}
        }
        let getNextEmailAndArchive = () => {
            {emit('changeEmail', {toggleArchived: true, save:true, changeIndex: 1})}
        }

        let getPreviousEmailAndArchive = () => {
            {emit('changeEmail', {toggleArchived: true, save:true, changeIndex: -1})}
        }
        useKeydown([
            {key: 'r', fn: toggleRead},
            {key: 'e', fn: toggleArchived},
            {key: 'n', fn: getNextEmail},
            {key: 'm', fn: getNextEmailAndArchive},
            {key: 'p', fn: getPreviousEmail},
            {key: '[', fn: getPreviousEmailAndArchive}
        ])
        return{
            format,
            marked, 
            toggleRead, 
            toggleArchived, 
            getPreviousEmail,
            getNextEmail, 
            emit
        }
    },
    props:{
        email: {
            type: Object, 
            required: true
        }, 
        showNext: {
            type: Boolean, 
            required: true
        },
        showPrevious: {
            type: Boolean, 
            required: true
        }
    }
}
</script>
<style scoped>

</style>