import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import {
  Alert,
  AlertIcon,
  Heading,
  Box,
  Center,
  Text,
  Stack,
  Button,
  useColorModeValue,
  VStack,
  Input,
  FormControl,
  FormLabel,
  ChakraProvider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
} from "@chakra-ui/react";
import * as _ from "lodash";
import {
  HeroesApi,
  GetSuperhero,
  Configuration,
  SuperPower,
  UpdateSuperhero,
  CreateSuperhero,
  GetHeroes,
} from "./lib/api/";
import { AxiosResponse } from "axios";

// These functions should be in a provider component https://www.patterns.dev/posts/provider-pattern
// START API FUNCTIONS
const getApi = (): HeroesApi => {
  return new HeroesApi(
    // TODO: replace with your own API URL
    new Configuration({ basePath: "http://localhost:8000" })
  );
};

const getHeroes = async (): Promise<AxiosResponse<GetHeroes, any>> => {
  const api = getApi();
  return await api.getHeroesHeroesGet();
};

const createHero = async (
  hero: CreateSuperhero
): Promise<AxiosResponse<GetSuperhero, any>> => {
  const api = getApi();
  return await api.createHeroHeroesPost(hero);
};

const updateHero = async (
  heroId: string,
  hero: UpdateSuperhero
): Promise<AxiosResponse<GetSuperhero, any>> => {
  const api = getApi();
  return await api.updateHeroHeroesIdPut(heroId, hero);
};
// END API FUNCTIONS

interface HeroEditModalProps {
  onSave: (hero: GetSuperhero) => void;
  onClose: () => void;
  hero: GetSuperhero | null;
  isOpen: boolean;
}

function HeroEditModal(props: HeroEditModalProps) {
  const { onSave, onClose, hero, isOpen } = props;
  const [name, setName] = useState<string>(hero?.name || "");
  const [superPower, setSuperPower] = useState<SuperPower>(
    hero?.super_power || SuperPower.Rich
  );
  const [hometown, setHometown] = useState<string>(hero?.hometown || "");

  const onSaveClick = () => {
    const heroToSave = {
      name: name,
      super_power: superPower,
      id: hero?.id || "",
      hometown: hometown,
    } as GetSuperhero;
    onSave(heroToSave);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Hero</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {hero?.id && <Text>ID: {hero?.id}</Text>}
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Hometown</FormLabel>
            <Input
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Super Power</FormLabel>
            <Select
              value={superPower}
              onChange={(e) => setSuperPower(e.target.value as SuperPower)}
            >
              {_.map(Object.values(SuperPower), (s) => {
                return (
                  <option key={s} value={s}>
                    {_.startCase(s)}
                  </option>
                );
              })}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onSaveClick}>
            Save
          </Button>
          <Button colorScheme="red" onClick={props.onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

interface HeroCardProps {
  hero: GetSuperhero;
  onEditClick: (heroId: string) => void;
}

function HeroCard(props: HeroCardProps) {
  const { hero, onEditClick } = props;

  return (
    <Box
      maxW={"320px"}
      w={"full"}
      bg={useColorModeValue("white", "gray.900")}
      boxShadow={"2xl"}
      rounded={"lg"}
      p={6}
      textAlign={"center"}
    >
      <Heading fontSize={"2xl"} fontFamily={"body"}>
        {hero.name}
      </Heading>
      <Text
        textAlign={"center"}
        color={useColorModeValue("gray.700", "gray.400")}
        px={3}
      >
        {_.startCase(hero.super_power || "")}
      </Text>
      <Text
        textAlign={"center"}
        color={useColorModeValue("gray.700", "gray.400")}
        px={3}
      >
        {hero.hometown}
      </Text>
      <Stack mt={8} direction={"row"} spacing={4}>
        <Button
          flex={1}
          fontSize={"sm"}
          rounded={"full"}
          _focus={{
            bg: "gray.200",
          }}
          onClick={() => onEditClick(hero.id)}
        >
          Edit
        </Button>
      </Stack>
    </Box>
  );
}

function App() {
  const [heroes, setHeroes] = useState<GetSuperhero[]>([] as GetSuperhero[]);
  const [selectedHeroToEdit, setSelectedHeroToEdit] =
    useState<GetSuperhero | null>(null);
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getAndSetHeroes = async () => {
    const response = await getHeroes();
    setHeroes(response.data.heroes);
    setSelectedHeroToEdit(null);
  };

  const onHeroSave = (hero: GetSuperhero) => {
    if (hero?.id && !_.isEmpty(hero.id)) {
      updateHero(hero.id, {
        name: hero.name,
        super_power: hero.super_power,
        hometown: hero.hometown,
      } as UpdateSuperhero)
        .then((r) => {
          // TODO: being lazy here and just re-fetching the entire list
          getAndSetHeroes();
        })
        .catch((e) => {
          console.error(e);
          setErrorMessage(e.message);
        });
    } else {
      createHero({
        name: hero.name,
        super_power: hero.super_power,
        hometown: hero.hometown,
      } as CreateSuperhero)
        .then((r) => {
          getAndSetHeroes();
        })
        .catch((e) => {
          console.error(e);
          setErrorMessage(e.message);
        });
    }
  };

  const onEditClick = (heroId: string) => {
    const hero = _.find(heroes, (h) => h.id === heroId);
    if (hero) {
      setSelectedHeroToEdit(hero);
      onOpen();
    } else {
      console.error(`Somehow hero with id ${heroId} was not found`);
    }
  };

  const onNewClick = () => {
    setSelectedHeroToEdit({} as GetSuperhero);
    onOpen();
  };

  const onCloseModal = () => {
    setSelectedHeroToEdit(null);
    onClose();
  };

  const getHeroesCallback = useCallback(getAndSetHeroes, []);
  useEffect(() => {
    getHeroesCallback()
      .then()
      .catch((e) => {
        console.error(e);
        setErrorMessage(e.message);
      });
  }, [getHeroesCallback]);

  return (
    <ChakraProvider>
      <Box>
        <Center py={6}>
          <VStack>
            <Heading>The Hero Index</Heading>
            {heroes.map((hero) => (
              <HeroCard key={hero.id} hero={hero} onEditClick={onEditClick} />
            ))}
            <Box
              maxW={"320px"}
              w={"full"}
              bg={useColorModeValue("white", "gray.900")}
              boxShadow={"2xl"}
              rounded={"lg"}
              p={6}
              textAlign={"center"}
            >
              <Heading fontSize={"2xl"} fontFamily={"body"}>
                Add New
              </Heading>
              <Stack mt={8} direction={"row"} spacing={4}>
                <Button
                  flex={1}
                  fontSize={"sm"}
                  rounded={"full"}
                  _focus={{
                    bg: "gray.200",
                  }}
                  onClick={onNewClick}
                >
                  +
                </Button>
              </Stack>
            </Box>
            {errorMessage && (
              <Alert status="error">
                <AlertIcon />
                {errorMessage}
              </Alert>
            )}
          </VStack>
        </Center>
      </Box>
      {selectedHeroToEdit && (
        <HeroEditModal
          isOpen={isOpen}
          onClose={onCloseModal}
          hero={selectedHeroToEdit}
          onSave={onHeroSave}
        />
      )}
    </ChakraProvider>
  );
}

export default App;
