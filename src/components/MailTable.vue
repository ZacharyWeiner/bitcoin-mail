<template>
    <div>
        <table class='mail-table'>
            <tbody>
            <tr v-for="email in unarchivedEmails" :key='email.id' :class="['clickable', email.read? 'read' : '']"
                @click="openEmail(email)"> 
                <td><input type='checkbox'/> </td>
                <td>{{email.from}}</td>
                <td><strong>{{email.subject}}</strong></td>
                <td class='date'>{{format(new Date(email.sentAt), 'MMM dd yyyy') }}</td>
                <td><button @click="archiveEmail(email)"> archive </button></td>
            </tr>
            </tbody>
        </table>
        <ModalView v-if="emailSelected" @closeModal="emailSelected = false">
            <MailView :email="openedEmail" :showNext="showNext" :showPrevious="showPrevious" @changeEmail="changeEmail"/>
        </ModalView>
        <!-- <NewMessage :computer="computer" /> -->
    </div>
</template>

<script>
import { format } from 'date-fns';
import  axios  from 'axios'; 
import MailView from '@/components/MailView.vue'
import ModalView from '@/components/ModalView.vue'
import { ref } from 'vue'
import Computer from 'bitcoin-computer'
// import NewMessage from '@/components/NewMessage.vue'
export default {
    async setup(){
    let response = await axios.get('http://localhost:3000/emails')
    console.log(response.data)
    let emails = ref(response.data)
    let openedEmail = null
    let emailSelected = ref(false)
    const computer = await new Computer({network: "testnet", chain: "BSV", seed: "flash wink van suit only spike cart yellow stadium effort detail ill"})
    return {
      format, 
      emails, 
      openedEmail,
      emailSelected,
      computer
    }
  },
  components: {
    MailView, 
    ModalView,
    // NewMessage
  }, 
  computed: {
    sortedEmails(){
      return this.emails.sort((e1, e2) => {
        return e1.sentAt < e2.sentAt ? 1 : -1 
      })
    }, 
    unarchivedEmails(){
      return this.sortedEmails.filter(e => !e.archived) 
    }, 
    showNext(){
        if(this.getEmailIndex() == (this.unarchivedEmails.length - 1)){
            return false
        }
        return true
    }, 
    showPrevious(){
        if(this.getEmailIndex() == 0 ){
            return false
        }
        return true
    }
  }, 
  methods: {
      openEmail(email){
          email.read = true
          this.emailSelected = true
          this.updateEmail(email)
          this.openedEmail = email
          console.log("clicked an email to open", this.openedEmail)
      },
      archiveEmail(email){
          email.archived = true
          this.updateEmail(email)
      },
      updateEmail(email){  
        axios.put(`http://localhost:3000/emails/${email.id}`, email)
      }, 
      changeEmail({toggleRead, toggleArchived, save, closeModal, changeIndex}){
          console.log('changed')
          let email = this.openedEmail
          if(toggleRead){email.read = !email.read}
          if(toggleArchived){email.archived = !email.archived}
          if(save){this.updateEmail(email)}
          if(closeModal){email = null}
          if(changeIndex){
              let currentIndex = this.getEmailIndex()
              console.log('EL:' + this.unarchivedEmails.length.toString() )
              console.log('CI:' + currentIndex.toString() )
              if(this.unarchivedEmails.length >= currentIndex && currentIndex >= 0){
                let newEmail = this.unarchivedEmails[currentIndex + changeIndex]
                this.openEmail(newEmail)
              }
          }
      },
      getEmailIndex(){
          let emails = this.unarchivedEmails
          return emails.indexOf(this.openedEmail)
      },
  }
}
</script>

<style scoped>
</style>