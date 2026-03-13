import Dyslexia2IMage from '../assets/dyslexia3.png'

const Home=()=>{

     return (
        <>
       
        <section className="container mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center justify-between gap-12">
               <div className="max-w-2xl">
                 <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
                   Web accessibility made simple
                 </h1>
                 <span className="text-xl text-gray-700 leading-relaxed mb-8">
                   By adding just some line of JavaScript code, you can make your website accessible to a much wider audience with Learnig disbality like <span className='text-red-500 text-bold'>ADHD, Dyslexia</span> . You can customize the widget, Customize your Expereince Now  
                 </span>
                 <button className="mt-4 bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition text-lg font-semibold">
                   Download Extension →
                 </button>
               </div>
               <div className="w-full lg:w-1/2">
                 <img
                   src={Dyslexia2IMage} 
                   alt="Breaking barriers in accessibility"
                   width={600}
                   height={400}
                   className="rounded-2xl shadow-2xl"
                 />
               </div>
             </section>


      {/* <section className="max-w-7xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-10">

      
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-5">
            Solutions to break barriers.
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed">
            With over 20 unique problem-solving verticals, BetterWeb.Ai is the
            world's most versatile company in accessibility. From helping your
            users access content to give feedback, our products help you break
            barriers to universal access.
          </p>
        </div>


        <div className="flex justify-center md:justify-end">
          <img
            // src={landingImage}
            src={Dyslexia2IMage}
            alt="Accessibility Illustration"
            className="w-[550px] md:w-[650px] object-contain select-none"
          />
        </div>
      </section> */}

      {/* MIDDLE SECTION */}
      <section className="max-w-6xl mx-auto px-8 mt-10">
        <p className="text-gray-700 text-lg leading-relaxed">
          Betterweb.Ai Platform consists of three products  Extension, AiAgent,
          and Website, and our Developer Platform. Each product has several
          features designed to make technology more accessible.
        </p>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="max-w-6xl mx-auto px-8 mt-14 grid md:grid-cols-3 gap-10">
        
        {/* AGASTYA */}
        <div>
          <div className="text-5xl">🌞</div>
          <h3 className="text-xl font-bold text-orange-600 mt-3">AiAgent</h3>
          <p className="text-gray-600">Accessibility for websites</p>
          <button className="text-orange-600 font-medium mt-2">
            Get started for free →
          </button>
        </div>


        {/* VALMIKI */}
        <div>
          <div className="text-5xl">🟢</div>
          <h3 className="text-xl font-bold text-green-700 mt-3">Extension</h3>
          <p className="text-gray-600">Accessibility for browsers</p>
          <button className="text-green-600 font-medium mt-2">
            Download for your browser →
          </button>
        </div>

      </section>
        </>
     )
}

export default Home 