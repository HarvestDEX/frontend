import Navbar from './components/landing/Navbar'
import Hero from './components/landing/Hero'
import PriceMarquee from './components/landing/PriceMarquee'
import Features from './components/landing/Features'
import HowItWorks from './components/landing/HowItWorks'
import Commodities from './components/landing/Commodities'
import Footer from './components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <PriceMarquee />
      <div id="features">
        <Features />
      </div>
      <div id="how">
        <HowItWorks />
      </div>
      <div id="prices">
        <Commodities />
      </div>
      <Footer />
    </main>
  )
}
