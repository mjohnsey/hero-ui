import { AxiosResponse } from "axios";

import {
  HeroesApi,
  GetSuperhero,
  Configuration,
  UpdateSuperhero,
  CreateSuperhero,
  GetHeroes,
} from "./lib/api/";

export default function useHeroes() {
  const api = new HeroesApi(
    new Configuration({ basePath: "http://localhost:8000" })
  );

  return {
    getApi: (): HeroesApi => {
      return api;
    },
    getHeroes: async (): Promise<AxiosResponse<GetHeroes, any>> => {
      return await api.getHeroesHeroesGet();
    },
    createHero: async (
      hero: CreateSuperhero
    ): Promise<AxiosResponse<GetSuperhero, any>> => {
      return await api.createHeroHeroesPost(hero);
    },
    updateHero: async (
      heroId: string,
      hero: UpdateSuperhero
    ): Promise<AxiosResponse<GetSuperhero, any>> => {
      return await api.updateHeroHeroesIdPut(heroId, hero);
    },
  };
}
