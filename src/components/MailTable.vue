  <template>
    <div>
      <div v-if="!this.seed_string"> 
         <input type="text" id="seed" name="seed">
        <button @click="login"> Login </button>
      </div>
      <div v-if="this.seed_string"> 
        <div> {{publicKey}} </div>
        <button v-if="loggedIn" @click="logout" className='error-button'> Logout </button>
        <button v-if="loggedIn" @click="showNewEmail" > + New Tmail </button>
        <div v-if="!has_emails">You Have No New Mail In Your Inbox</div>
        <table v-if="loggedIn" class='mail-table'>
            <tbody>
            <tr v-for="email in unarchivedEmails" :key='email.id' :class="['clickable', email.read? 'read' : '']"
                @click="openEmail(email)"> 
                <td><input type='checkbox'/> </td>
                <td> From: {{email.from.substring(email.from.length -16, email.from.length)}}</td>
                <td>Subject <strong>{{email.subject}}</strong></td>
                <td class='date'>{{email.lastUpdated }}</td>
                <td><button @click="archiveEmail(email)" className="warning-button"> archive </button></td>
            </tr>
            </tbody>
        </table>
        <ModalView v-if="emailSelected" @closeModal="emailSelected = false">
            <MailView :email="openedEmail" :showNext="showNext" :showPrevious="showPrevious" @changeEmail="changeEmail"/>
        </ModalView>
        <ModalView v-if="newEmail" @closeModal="newEmail = false">
          <NewMessage :newEmail="newEmail"></NewMessage>
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
      let seed_string = ref ("")
      seed_string = window.localStorage.getItem("SEED")
      let has_emails = ref(false)
      console.log(seed_string)
      let emails;
      let openedEmail = ref(null)
      let emailSelected = ref(false)
      let newEmail = ref(false)
      let publicKey = ref("")
      if( seed_string !== null){
        const _computer = await new Computer({network: "testnet", chain: "BSV", seed: seed_string})
        publicKey = _computer.db.wallet.getPublicKey().toString()
        let revs = await _computer.getRevs(_computer.db.wallet.getPublicKey())
        console.log("Get Revs:", revs)
        let ids = []
        let synced = await Promise.all(revs.map(async lr => {
          let _mail =  await _computer.sync(lr)
          console.log("Object ID:", _mail._id, "Rev: ", _mail._rev)
          if(!ids.includes(_mail._id)){
            ids.push(_mail._id)
            return _mail
          }
        }))

        var t2 =  await Promise.all(ids.map(async id => {
          let _rev = await _computer.getLatestRev(id)
          let _mail = await _computer.sync(_rev)
          console.log(_mail)
          return _mail
        }))

        var filtered = synced.filter(function (el) {
          return el != null;
        });
        emails = ref(t2)
        has_emails = (t2.filter(e => !e.archived).length > 0)

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
        seed_string, 
        publicKey, 
        has_emails
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
        return e1.lastUpdated < e2.lastUpdated ? 1 : -1 
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
          this.openedEmail = email
          if (!email.isRead){
            const computer = await new Computer({network: "testnet", chain: "BSV", seed: this.seed_string})
            const fromKey = await computer.db.wallet.getPublicKey().toString()
            console.log("TO: ", email.to, "This: ", fromKey)
            try{
            let response = await email.read(fromKey)
            console.log("Response: ", response)
            }catch(err){alert(err)}
          }
      },
      async archiveEmail(email){
        if(!email.archived){
           return await email.archive(this.publicKey)
          }
      },
      async changeEmail({toggleRead, toggleArchived, save, closeModal, changeIndex}){
          console.log('changed')
          const computer = await new Computer({network: "testnet", chain: "BSV", seed: this.seed_string})
          let lr = await computer.getLatestRev(this.openedEmail._id)
          let email = await computer.sync(lr)
          const fromKey = await computer.db.wallet.getPublicKey().toString()
          if(toggleRead){
            if(!email.read){
              await email.read(fromKey)
            }
          }
          if(toggleArchived){
            if(!email.archived){
              try{
                console.log('calling archive with key', fromKey)
                let tx =  await email.archive(fromKey)
                console.log('TX:', tx)
              }catch(err){alert(err)}
            }
          }
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