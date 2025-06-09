import '../css/Bio.css';
import chrisHeadshot from '../assets/chrisheadshot.jpg';
import Doyle from '../assets/Doyle.png';

const creators = [
  { 
    name: "Andrew Cerna", 
    description: "Andrew is currently an aspiring web developer that has a history within the tech and engineering fields. He started his journey studying mechanical engineering at Syracuse University where he broadened his mind when it came to critical thinking and problem solving.  After graduating in late 2019, he decided to shift gears toward his original passion in technology. Post graduation he participated in bootcamps that allowed him get serval certification such as the CompTIA A+, AWS cloud practitioners, and AWS Solutions Architect. Today Andrew works Endeavor Streaming as an L2 support engineer but is looking to take the next step in his journey.  Currently he is looking to transition to a new role that will be more hands in development. One that allows him to work with and build the intricate information systems that allows websites to function", 
    image: "placeholder-andrew.jpg" 
  },
  { 
    name: "Christopher Del Grosso", 
    description: "Christopher Del Grosso is a Full Stack Web Developer and recent graduate of Columbia Engineering's Software Development Bootcamp. With a strong foundation in modern web technologies—including React, Node.js, GraphQL, TypeScript, and MongoDB—he specializes in building sleek, responsive, and intuitive user experiences. Passionate about turning complex problems into clean, functional solutions, Christopher brings creativity, attention to detail, and a commitment to continuous learning to every project he takes on.", 
    image: chrisHeadshot 
  },
  { 
    name: "Daniel Sisson", 
    description: "Recent full stack bootcamp graduate with a passion for building clean, responsive web applications from front to back. Experienced in developing React-based interfaces, managing GraphQL and RESTful APIs, and integrating modern state management practices. Strong focus on user experience, accessibility, and writing maintainable, scalable code.", 
    image: "placeholder-daniel.jpg" 
  },
  { 
    name: "Doyle Martin", 
    description: "Hey, I’m Doyle — a full-stack developer who loves bringing ideas to life with code. I’m all about building things that are useful, creative, and actually fun to use. Whether it’s a recipe app, a productivity tool, or something totally new, I like making tech that feels human.Right now, I’m working on projects that mix clean design with smart functionality. I work mostly with JavaScript, TypeScript, React, Node, GraphQL, and whatever else gets the job done well. I’ve got a buzz cut, green eyes, a few tattoos, and a no-BS approach to solving problems. If I’m not coding, I’m probably sketching ideas, learning something new, or planning my next move abroad.", 
    image: Doyle 
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
