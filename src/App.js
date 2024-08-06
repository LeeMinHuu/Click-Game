import { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [numberOfPoints, setNumberOfPoints] = useState(2);
  const [points, setPoints] = useState([]);
  const [nextPoint, setNextPoint] = useState(1);
  const [pointSize, setPointSize] = useState(20);

  const [time, setTime] = useState(0);
  const [startTimer, setStartTimer] = useState(false);

  const [startGame, setStartGame] = useState(false);
  const [gameStatus, setGameStatus] = useState(null);

  const canvasRef = useRef(null);
  const canvasFrameSize = {
    width: 700,
    height: 700,
  };

  useEffect(() => {
    let interval;
    if (startTimer) {
      interval = setInterval(() => setTime((prev) => prev + 0.1), 100); //Setup timer counter
    }
    return () => clearInterval(interval); // Cleanup function for useEffect hook.
  }, [startTimer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas

    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI); // Draw circle with pointSize radius
      ctx.fillStyle = point.fade ? "#ebebeb" : "#fff"; // Fill color
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "black";
      ctx.font = "15px Arial";
      ctx.fillText(point.number, point.x - 5, point.y + 5); // Text in circle
    });
  }, [points, pointSize]);

  const pointClickHandler = (number) => {
    // Stop timer and prevent user clicked more
    if (gameStatus === "GAME OVER") return;

    // Happen after user do 1st point
    if (!startTimer) {
      setStartTimer(true);
    }

    if (number === nextPoint) {
      // Check clicked point matched with expect point in the sequence
      setNextPoint(nextPoint + 1);
      // Faded point after clicking
      setPoints(
        points.map((point) =>
          point.number === number ? { ...point, fade: true } : point
        )
      );

      if (number === numberOfPoints) {
        // Check if last point was clicked
        setStartTimer(false);
        setGameStatus("ALL CLEAR");
      }

      // Removed clicked points from points array after faded
      setTimeout(() => {
        setPoints((points) =>
          points.filter((point) => point.number !== number)
        );
      }, 500);
    } else {
      // If user clicked wrong
      setStartTimer(false);
      setGameStatus("GAME OVER");
    }
  };

  const createPoints = () => {
    const newPoints = [];

    while (newPoints.length < numberOfPoints) {
      // Create each point information
      const newPoint = {
        number: newPoints.length + 1,
        x: Math.random() * (canvasFrameSize.width - 40) + 20,
        y: Math.random() * (canvasFrameSize.height - 40) + 20,
        fade: false,
      };

      // Check new point not overlapping
      if (
        !newPoints.some(
          (point) =>
            Math.sqrt(
              (point.x - newPoint.x) ** 2 + (point.y - newPoint.y) ** 2
            ) < 40
        )
        // if distance < 40, the points is overlapping
      ) {
        newPoints.push(newPoint);
      }
    }

    setPoints(newPoints);
    setTime(0);
    setNextPoint(1);
    setStartTimer(false);
    setStartGame(true);
  };

  const gameReset = () => {
    setStartGame(false);
    setGameStatus(null);
    createPoints();
  };

  const canvasHandler = (e) => {
    const rect = canvasRef.current.getBoundingClientRect(); //Get size & position canvas

    //Measure x & y coordinates of click
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.forEach((point) => {
      const d = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
      if (d < 20) {
        // If d (distance) <20, click is in point radius and call pointClickHandler function.
        pointClickHandler(point.number);
      }
    });
  };

  return (
    <div className="click-game">
      <div className="container">
        <div className="header">
          <h1>
            {!gameStatus && <p>LET'S PLAY</p>}
            {gameStatus === "ALL CLEAR" && (
              <p style={{ color: "green" }}>{gameStatus}</p>
            )}
            {gameStatus === "GAME OVER" && (
              <p style={{ color: "red" }}>{gameStatus}</p>
            )}
          </h1>

          <div>
            Points:
            <input
              type="number"
              value={numberOfPoints}
              onChange={(e) => setNumberOfPoints(Number(e.target.value))}
              min="2"
            />
          </div>

          <div>
            Point Size (optional):
            <input
              type="number"
              value={pointSize}
              onChange={(e) => setPointSize(Number(e.target.value))}
            />
            px
          </div>

          <div>
            Time: <strong>{time.toFixed(1)}s</strong>
          </div>

          <button onClick={startGame ? gameReset : createPoints}>
            {startGame ? "Restart" : "Play"}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasFrameSize.width}
        height={canvasFrameSize.height}
        onClick={(e) => canvasHandler(e)}
      />
    </div>
  );
}
