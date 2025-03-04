import { BestPractices, BestPracticesEmpty } from "@/components/BestPractices";
import ChatInterface from "@/components/ChatInterface";
import CropForm from "@/components/CropForm";
import { FertilizerRecommdation, FertilizerRecommdationEmpty } from "@/components/FertilizerRecommdations";
import { RecommendedCrops } from "@/components/RecommendedCrops";
import { Weather } from "@/components/Weather";
import axios from "axios";
import { Leaf, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface CropDetails {
  name: string;
  location: string;
  size: string;
  soilType: string;
  irrigationMethod: string;
  plantingDate: Date;
  usingFertilizer: string;
}

interface AiCropResponse {
  fertilizerData: {
    name: string;
    use: string;
    price: string;
  }[],
  bestPracticesData: {
    cropName: string;
    farmingPractices: any[];
  }

}

export default function Dashboard() {
    const [city, setCity] = useState("Pune");
    const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
    const [cropDetails, setCropDetails] = useState<CropDetails>({
      name: "",
      location: city ?? "",
      size: "",
      soilType: "",
      irrigationMethod: "",
      plantingDate: new Date(),
      usingFertilizer: "yes"
    });
    const [aiCropResponse, setAiCropResponse] = useState<AiCropResponse | null>(null);

    const handleCropDetailsSubmit = (e: CropDetails) => {
        setCropDetails(e);
        axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/ai/crop`, cropDetails).then(res => {
          console.log(JSON.stringify(res.data));
          setAiCropResponse(res.data);
        }).catch(err => {
          console.log(err);
        });
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        });
      }, []); 
    
      useEffect(() => {
        if (coordinates.lat !== 0 && coordinates.lon !== 0) {
          console.log(coordinates.lat, coordinates.lon, import.meta.env.VITE_API_KEY);
          
          fetch(`https://us1.locationiq.com/v1/reverse?key=${import.meta.env.VITE_API_KEY}&lat=${coordinates.lat}&lon=${coordinates.lon}&format=json`)
            .then((res) => res.json())
            .then((data) => {
              setCity(data.address.city);
            })
            .catch((error) => console.error("Error fetching city:", error));
        }
      }, [coordinates]); 
      console.log(city);
  return (
    <div className="flex min-h-screen flex-col bg-background items-center">
      <AppBar city={city} />
      <div className="container flex-1 gap-12 p-4 md:p-6 2xl:p-8">
        <div className="flex-1 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="w-[91vw] md:w-auto col-span-full lg:col-span-3 space-y-4">
                <CropForm city={city} handleCropDetailsSubmit={handleCropDetailsSubmit} />
                {!aiCropResponse && <FertilizerRecommdationEmpty />}
                {aiCropResponse && <FertilizerRecommdation data={aiCropResponse.fertilizerData} />}
            </div>
            <div className="w-[91vw] md:w-auto col-span-full lg:col-span-4 space-y-4">
                <Weather city={city} />
                <RecommendedCrops city={city} />
                {!aiCropResponse && <BestPracticesEmpty />}
                {aiCropResponse && <BestPractices data={aiCropResponse.bestPracticesData} />}
                <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppBar({city}: {city: string}) {
  const navigate = useNavigate();
  return (
  <header className="w-full py-6 px-8 border-b border-gray-200">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center cursor-pointer gap-2" onClick={() => navigate("/")}>
        <Leaf className="h-6 w-6 text-green-600" />
        <span className="text-xl font-medium">FarmXpert</span>
      </div>
      <div className="flex items-center justify-center gap-1 mr-4">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-md text-muted-foreground">{city.toUpperCase()}</span>
      </div>
    </div>
  </header>
)}