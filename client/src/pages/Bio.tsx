import '../css/Bio.css';

const creators = [
  { 
    name: "Andrew Cerna", 
    description: "<Insert description of Andrew here>", 
    image: "placeholder-andrew.jpg" 
  },
  { 
    name: "Christopher Del Grasso", 
    description: "<Insert description of CDG here>", 
    image: "placeholder-christopher.jpg" 
  },
  { 
    name: "Daniel Sisson", 
    description: "<Insert description of Daniel here>", 
    image: "placeholder-daniel.jpg" 
  },
  { 
    name: "Doyle Martin", 
    description: "<Insert description of Doyle here>", 
    image: "placeholder-doyle.jpg" 
  },
];

const Bio = () => {
  return (
    <div className="bio-page">
      <h1>Meet the Creators</h1>
      <p>This site was created by a team of passionate developers who love cooking and technology.</p>
      <p>We believe in making cooking accessible and enjoyable for everyone.</p>

      <div className="content-grid">
        {creators.map((creator, index) => (
          <div key={index} className="box">
            <img src={creator.image} alt={creator.name} className="creator-img" />
            <h2>{creator.name}</h2>
            <p>{creator.description}</p>
          </div>
        ))}
      </div>

      <p className="footer">We hope you enjoy using our site as much as we enjoyed creating it!</p>
    </div>
  );
};

export default Bio;
