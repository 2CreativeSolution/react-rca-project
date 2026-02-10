import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const handleAddToCart = () => {
    // until auth is ready, always redirect to login
    navigate("/login");
  };

  return (
    <div className="bg-gray-50 w-full">

      {/* TOP PROMO BANNER */}
      <div className="bg-blue-900 text-white text-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between">
          <span>🔥 Limited time offer: Get up to $150 off on new connections</span>
          <span className="font-medium">T&Cs Apply</span>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold mb-4">
            One connection for everything you need
          </h1>
          <p className="text-lg mb-8 max-w-2xl">
            High-speed internet, unlimited calling, and premium TV —
            all in one simple plan.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-700 px-6 py-3 rounded-md font-semibold"
          >
            View Plans
          </button>
        </div>
      </section>

      {/* DISCOUNTS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Exclusive Online Offers</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Internet + TV Combo",
              desc: "Save $120 on annual subscription",
            },
            {
              title: "Unlimited Calling",
              desc: "First 3 months free",
            },
            {
              title: "Family Plans",
              desc: "Up to 4 lines with shared data",
            },
          ].map((offer, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-lg p-6"
            >
              <h3 className="font-semibold mb-2">{offer.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{offer.desc}</p>
              <button
                onClick={handleAddToCart}
                className="text-blue-600 font-medium text-sm"
              >
                Get Offer →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* OUR SERVICES */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Our Services</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Mobile Plans",
              desc: "Unlimited calls & data",
              price: "$45 / month",
            },
            {
              name: "Home Internet",
              desc: "Up to 1 Gbps speed",
              price: "$60 / month",
            },
            {
              name: "TV & Streaming",
              desc: "150+ channels included",
              price: "$40 / month",
            },
          ].map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="font-semibold mb-2">{service.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {service.desc}
              </p>
              <div className="font-semibold mb-4">{service.price}</div>
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-2 rounded-md text-sm"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLING PLANS */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Best Selling Plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: "All-In-One Max",
              desc: "Mobile + Internet + TV",
              price: "$99 / month",
            },
            {
              name: "Unlimited Plus",
              desc: "Best for families & streaming",
              price: "$79 / month",
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-lg p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.desc}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold mb-2">{plan.price}</div>
                <button
                  onClick={handleAddToCart}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
