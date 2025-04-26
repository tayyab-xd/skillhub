import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/context';
import { NavLink } from 'react-router-dom';

const Gigs = () => {
  const context = useContext(AppContext)
  const data = context.state.gigs
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    setGigs(data && data)
  }, [data]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-center"> All Gigs</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gigs && gigs.map((gig) => (
          <div key={gig._id} className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition">
            <img
              src={`https://link.storjshare.io/raw/jub6kg32liwv44ypptxr3bry5bzq/skill-hub/${gig.images[0]}`}
              alt="Course Thumbnail"
              className="w-full h-40 object-cover"
            />
            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{gig.title}</h2>
              <p className="text-white/80 text-sm">{gig.description.slice(0, 80)}...</p>
              <div className="flex justify-between items-center text-sm mt-3">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-white">{gig.category}</span>
                <span className="font-bold text-green-400">Rs {gig.price}</span>
              </div>
              <p className="text-xs text-white/50 mt-2">Delivery: {gig.deliveryTime} days</p>
            </div>
            <NavLink to={`/singlegig/${gig._id}`}>
              <button className="bg-blue-500 py-2 px-4 rounded-lg w-full hover:bg-blue-600 transition">
                View Gig
              </button>
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gigs;


