import CustomerConversations from '../components/CustomerConversations'
import './PageShell.css'

export default function MessagesPage() {
  return (
     <div className="pg pg-wide">
      <header className="pg-head">
        <h1>Messages</h1>
        <p>Your conversations with providers.</p>
      </header>
    <CustomerConversations />
    </div>
  )
}