import ContactsPage from "./components/contacts/ContactsPage";
import Footer from "./components/footer/footer";
import Header from "./components/header/header";
import Promo from "./components/promo/promo";
import ServicesPage from "./components/services/ServicesPage";

function App() {

  return (
    <div className='App'>
    <Header />
    <Promo />
    <ServicesPage />
    <ContactsPage />
    <Footer />
    </div>
  )
}

export default App;
