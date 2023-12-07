import { QueryClient, QueryClientProvider } from "react-query";
import UpdateValues from "./components/Update";
import ShowValues from "./components/ShowValues";
import "./App.css";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<div className="app">
				<UpdateValues />
				<ShowValues />
			</div>
		</QueryClientProvider>
	);
}

export default App;
