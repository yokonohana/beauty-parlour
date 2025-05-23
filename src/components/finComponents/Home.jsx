import ContactsPage from "../contacts/ContactsPage";
import Footer from "../footer/footer";
import Header from "../header/header";
import Promo from "../promo/promo";
import ServicesPage from "../services/ServicesPage";

function Home() {
  return (
    <div className='App'>
      <Header />
      <Promo />
      <ServicesPage />
      <ContactsPage />
      <Footer />
    </div>
  );
}

export default Home;