<template>
    <div class='email-display'>
        <div> 
            <div> 
                <button v-if="showPrevious" @click="getPreviousEmail" className="previous-button">&lt; Previous</button> 
                <button @click="toggleRead" className="default-button">{{ email.read ?  'Mark As Unread (r)': 'Mark As Read (r)'  }}</button> 
                <button @click="toggleArchived" className="warning-button">{{email.archived ? 'Un-archive (e)' : 'Archive (e)'}}</button> 
                <button v-if="showNext" @click="getNextEmail" className="blue-button">Next &gt;</button> 
             </div>
        </div>
        
        <h2 class='mb-0'> Subject: <strong> {{email.subject}} </strong> </h2>
        <div> <em> From {{email.from}} on {{email.sent}} </em></div>
        <div v-html="marked(email.body)"/>
        <button  @click="reply" className="blue-button"> Reply</button> 
        <div v-if="showReply"> 
            <textarea v-model="message"/>
            <button @click="send" >Send</button>
        </div>
    </div>
</template>
<script>
import { ref } from 'vue'
import { format } from 'date-fns';
import  marked from 'marked';
import  axios  from 'axios';
import useKeydown from '../composables/use-keydown'
import Computer from 'bitcoin-computer'
export default {
    setup(props, {emit}){
        let showReply = ref(false)
        let message = ref('')
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
            emit,
            showReply
        }
    },
    methods: {
        reply(){
            console.log("clicked")
            this.showReply = true
        },
        async send(){
            let seed_string = window.localStorage.getItem("SEED")
            const computer = await new Computer({network: "testnet", chain: "BSV", seed: seed_string})
            const fromKey = await computer.db.wallet.getPublicKey().toString()
            this.email.reply(fromKey, this.message)
            console.log(this.message)
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