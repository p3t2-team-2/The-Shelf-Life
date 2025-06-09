import '../css/Bio.css';
import chrisHeadshot from '../assets/chrisheadshot.jpg';
import Doyle from '../assets/Doyle.png';
import daniel from '../assets/danielheadshot.jpg';
import andrew from '../assets/andrew.jpg';

const creators = [
  { 
    name: "Andrew Cerna", 
    description: "Andrew is currently an aspiring web developer that has a history within the tech and engineering fields. He started his journey studying mechanical engineering at Syracuse University where he broadened his mind when it came to critical thinking and problem solving.  After graduating in late 2019, he decided to shift gears toward his original passion in technology. Post graduation he participated in bootcamps that allowed him get serval certification such as the CompTIA A+, AWS cloud practitioners, and AWS Solutions Architect. Today Andrew works Endeavor Streaming as an L2 support engineer but is looking to take the next step in his journey.  Currently he is looking to transition to a new role that will be more hands in development. One that allows him to work with and build the intricate information systems that allows websites to function", 
    image: andrew
  },
  { 
    name: "Christopher Del Grosso",
    description: "Christopher Del Grosso is a Full Stack Web Developer and soon-to-be graduate of Columbia Engineering's Software Development Bootcamp. With a strong foundation in modern web technologies—including React, Node.js, GraphQL, TypeScript, and MongoDB—he specializes in building sleek, responsive, and intuitive user experiences. Passionate about turning complex problems into clean, functional solutions, Christopher brings creativity, attention to detail, and a commitment to continuous learning to every project he takes on. He thrives in collaborative environments and enjoys tackling challenges that push him to grow both technically and personally. Christopher emphasizes writing maintainable, scalable code and has experience deploying full-stack applications on platforms like Render and Netlify. When he's not coding, he enjoys exploring new tech trends and contributing to open source projects.",
    image: chrisHeadshot
  },
  { 
    name: "Daniel Sisson", 
    description: "Recent full-stack bootcamp graduate with a passion for building clean, responsive web applications from front to back. Skilled in developing React-based interfaces, managing GraphQL and RESTful APIs, and implementing modern state management practices. I hold a degree from Purdue University (2013) and bring over a decade of experience in medical device manufacturing, during which I worked as a development engineer and quality engineer. My problem-solving expertise enables me to quickly adapt to new technologies and bridge the gap created by my lack of professional software experience. With a strong focus on user experience, accessibility, and writing maintainable, scalable code, I am eager to contribute to both front-end and back-end development. Currently seeking opportunities to apply my skills in a collaborative environment where I can work on impactful projects and continue growing as a developer.", 
    image: daniel
  },

  { 
    name: "Doyle Martin", 
    description: "Doyle is a full-stack developer who thrives on building creative, functional tools that make life a little easier—and a lot more fun. He started his journey exploring design and storytelling, which shaped his human-first approach to technology. In 2024, he joined Columbia Engineering’s coding bootcamp, diving deep into JavaScript, TypeScript, React, Node.js, and GraphQL. Since then, he’s developed full-stack apps ranging from recipe managers to productivity tools, always blending clean design with practical function. Doyle’s no-BS problem solving, visual mindset, and adaptability make him a strong asset to any dev team. He’s currently seeking a role where he can keep growing and contribute to meaningful, user-focused projects. When he’s not coding, you can find him exploring new tech trends, playing guitar, or whipping up a new recipe in the kitchen.", 
    image: Doyle 
  },
];

const Bio = () => {
  return (
    <div className="bio-page">
      <h1>Meet the Creators</h1>
      <h3>This site was created by a team of passionate developers who love cooking and technology.</h3>
      <h3>We believe in making cooking accessible and enjoyable for everyone.</h3>

      <div className="content-grid">
        {creators.map((creator, index) => (
          <div key={index} className="box">
            <img src={creator.image} alt={creator.name} className="creator-img" />
            <h2>{creator.name}</h2>
            <p>{creator.description}</p>
          </div>
        ))}
      </div>

      <h3>We hope you enjoy using our site as much as we enjoyed creating it!</h3>
    </div>
  );
};

export default Bio;
