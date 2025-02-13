import { Header } from "@/components/Header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from 'recoil';
import { ChainlitAPI, ChainlitContext } from '@chainlit/react-client';

const CHAINLIT_SERVER_URL = 'http://sc8s8ggcgsokok88cc0sgkwo.161.35.104.63.sslip.io/';

const apiClient = new ChainlitAPI(CHAINLIT_SERVER_URL, 'webapp');

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChainlitContext.Provider value={apiClient}>
      <RecoilRoot>
        <Header />
        <Component {...pageProps} />
      </RecoilRoot>
    </ChainlitContext.Provider>
  );
}
