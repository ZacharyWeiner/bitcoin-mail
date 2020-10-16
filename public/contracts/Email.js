class Email {
    constructor(to, from, subject, body, sentAt){
        this._owners = [to, from]
        this.to = to 
        this.from = from
        this.subject = subject
        this.body = body
        this.sentAt = sentAt
        this.archived = false
        this.isRead = false
        this.replies = []
    }

    archive(pk){
        if(pk === this.to) this.archived = true
        return this.archived
    }
    
    read(pk){
        if(pk === this.to) this.isRead = true
        return this.isRead
    } 

    reply(pk, message){
        this.replies.push(pk + ":" + message)
    }
}