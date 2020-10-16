  <template>
    <div>
      <div v-if="!this.seed_string"> 
         <input type="text" id="seed" name="seed">
        <button @click="login"> Login </button>
      </div>
      <div v-if="this.seed_string"> 
        <button v-if="loggedIn" @click="logout"> Logout </button>
        <button v-if="loggedIn" @click="showNewEmail" > + New Tmail </button>
        <table v-if="loggedIn" class='mail-table'>
            <tbody>
            <tr v-for="email in unarchivedEmails" :key='email.id' :class="['clickable', email.read? 'read' : '']"
                @click="openEmail(email)"> 
                <td><input type='checkbox'/> </td>
                <td>{{email.from.substring(email.from.length -16, email.from.length)}}</td>
                <td><strong>{{email.subject}}</strong></td>
                <td class='date'>{{email.sentAt }}</td>
                <td><button @click="archiveEmail(email)"> archive </button></td>
            </tr>
            </tbody>
        </table>
        <ModalView v-if="emailSelected" @closeModal="emailSelected = false">
            <MailView :email="openedEmail" :showNext="showNext" :showPrevious="showPrevious" @changeEmail="changeEmail"/>
        </ModalView>
        <ModalView v-if="newEmail" @closeModal="newEmail = false">
          <NewMessage :newEmail="newEmail" ></NewMessage>
        </ModalView >
      </div>   
    </div>
</template>

<script>
import { format } from 'date-fns';
import  axios  from 'axios'; 
import MailView from '@/components/MailView.vue'
import ModalView from '@/components/ModalView.vue'
import { ref } from 'vue'
import Computer from 'bitcoin-computer'
import NewMessage from '@/components/NewMessage.vue'

export default {
    async setup(){
      let seed_string = window.localStorage.getItem("SEED")
      console.log(seed_string)
      let emails;
      let openedEmail = null
      let emailSelected = ref(false)
      let newEmail = ref(false)
      if( seed_string !== null){
        const _computer = await new Computer({network: "testnet", chain: "BSV", seed: seed_string})
        console.log(_computer.db.wallet.getPublicKey().toString())
        let revs = await _computer.getRevs(_computer.db.wallet.getPublicKey())
        console.log(revs)
        let synced = await Promise.all(revs.map(async r => {
          console.log('syncing:', r)
          return _computer.sync(r)
        }))
        emails = ref(synced)
        console.log(synced)
      }else{
        seed_string = ref("")
        emails = ref(null)
      }
      return {
        format, 
        emails, 
        openedEmail,
        emailSelected,
        newEmail,
        seed_string
      }
  },
  components: {
    MailView, 
    ModalView,
    NewMessage
  }, 
  computed: {
    sortedEmails(){
      if(!this.emails || this.emails.length < 2) return this.emails
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
    }, 
    loggedIn(){
      if(window.localStorage.getItem("SEED") === null) return false
      return true
    }
  }, 
  methods: {
      async openEmail(email){
          this.emailSelected = true
          this.isLoggedIn = window.localStorage.getItem("SEED") != null 
          //this.updateEmail(email)          
          this.openedEmail = email
          if (!email.isRead){
            const computer = await new Computer({network: "testnet", chain: "BSV", seed: "flash wink van suit only spike cart yellow stadium effort detail ill"})
            const fromKey = await computer.db.wallet.getPublicKey().toString()
            console.log("TO: ", email.to, "This: ", fromKey)
            try{
            let response = await email.read(fromKey)
            console.log("Response: ", response)
            }catch(err){alert(err)}
          }
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
      showNewEmail(){
        console.log("switiching")
        this.newEmail = true
      },
      async login(){
        console.log("SEED is: ", seed.value)
        window.localStorage.setItem("SEED", seed.value)
        window.location.reload()
        
      }, 
      logout(){
        console.log("Logging out")
        window.localStorage.clear()
        this.seed_string = null
        location.reload()
      }
  }

}
</script>

<style scoped>
  .mail-table{width: 100%}
</style>