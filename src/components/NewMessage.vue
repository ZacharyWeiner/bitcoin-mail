<template>
    <div>
      <form @submit="doSubmit" >
        <h1>Send Message</h1>
        <fieldset>
          <label for="to">To:</label>
          <input type="text" id="to" name="to" v-model="to" >
          <label for="subject">Subject:</label>
          <input type="text" id="subject" name="subject" >
          <label for="body">Message:</label>
          <textarea id="body" name="body" ></textarea>
        </fieldset>
        <button type="submit">Send Message</button>
      </form>
    </div>
</template>
<script>
import { ref } from 'vue'
import FileUtils from '@/utilities/FileUtils.js'
import Computer from 'bitcoin-computer'
export default {
    setup(props){
        console.log('setting up New Message:', props.reciever)
        let to = ref('')
        if(props.reciever){
            console.log(props.reciever)
            to = props.reciever
        }
        let subject = ref('')
        let body = ref('')
        return {to, subject, body}
    },
    methods: {
        async doSubmit(e){
            e.preventDefault()
            console.log('clicked')
            let seed_string = window.localStorage.getItem("SEED")
            const computer = await new Computer({network: "testnet", chain: "BSV", seed: seed_string})
            const fromKey = await computer.db.wallet.getPublicKey().toString()
            const EMAIL = await FileUtils.importFromPublic('contracts/Email.js')
            let date = new Date()
            try{
                console.log("To", to.value, "Subj: ", subject.value, "Body: ", body.value, "Date: ", date)
                let _email = await computer.new(EMAIL, [to.value, fromKey, subject.value, body.value, date.toString() ])
                console.log(_email)
            }catch(err){console.log(err)}
        }
    },
    props:{
        reciever: {
            type: String, 
            required: true
        }
    }
}
</script>
<style>
*, *:before, *:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', sans-serif;
  color: #384047;
}

form {
  max-width: 300px;
  margin: 10px auto;
  padding: 10px 20px;
  background: #f4f7f8;
  border-radius: 8px;
}

h1 {
  margin: 0 0 30px 0;
  text-align: center;
}

input[type="text"],
input[type="password"],
input[type="date"],
input[type="datetime"],
input[type="email"],
input[type="number"],
input[type="search"],
input[type="tel"],
input[type="time"],
input[type="url"],
textarea,
select {
  background: rgba(255,255,255,0.1);
  border: none;
  font-size: 16px;
  height: auto;
  margin: 0;
  outline: 0;
  padding: 15px;
  width: 100%;
  background-color: #e8eeef;
  color: #8a97a0;
  box-shadow: 0 1px 0 rgba(0,0,0,0.03) inset;
  margin-bottom: 30px;
}

input[type="radio"],
input[type="checkbox"] {
  margin: 0 4px 8px 0;
}

select {
  padding: 6px;
  height: 32px;
  border-radius: 2px;
}

button {
  padding: 19px 39px 18px 39px;
  color: #FFF;
  background-color: #4bc970;
  font-size: 18px;
  text-align: center;
  font-style: normal;
  border-radius: 5px;
  border: 1px solid #3ac162;
  border-width: 1px 1px 3px;
  box-shadow: 0 -1px 0 rgba(255,255,255,0.1) inset;
  margin-bottom: 10px;
}

.warning-button {
  background-color: darkgoldenrod;
  border: 1px solid darkgoldenrod;
}

.error-button {
  background-color: red;
  border: 1px solid red;
} 

.default-button {
  background-color: gray;
  border: 1px solid gray;
}

.previous-button {
  background-color: orange;
  border: 1px solid orange;
}

.blue-button {
  background-color: blue;
  border: 1px solid blue;
}

fieldset {
  margin-bottom: 30px;
  border: none;
}

legend {
  font-size: 1.4em;
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 8px;
}

label.light {
  font-weight: 300;
  display: inline;
}

.number {
  background-color: #5fcf80;
  color: #fff;
  height: 30px;
  width: 30px;
  display: inline-block;
  font-size: 0.8em;
  margin-right: 4px;
  line-height: 30px;
  text-align: center;
  text-shadow: 0 1px 0 rgba(255,255,255,0.2);
  border-radius: 100%;
}

@media screen and (min-width: 480px) {

  form {
    max-width: 480px;
  }

}
</style>