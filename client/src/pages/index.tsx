import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
} from '@chakra-ui/react';
import { CheckCircleIcon, LinkIcon } from '@chakra-ui/icons';

import { Hero } from '../components/Hero';
import { Container } from '../components/Container';
import { Main } from '../components/Main';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';
import Navbar from '../components/Navbar';

const Index = () => (
  <>
    <Navbar />
    <Container height='100vh'>
      <Hero />
      <Main>
        <Text color='text'>
          Example repository of <Code>Next.js</Code> + <Code>chakra-ui</Code> +{' '}
          <Code>TypeScript</Code>.
        </Text>

        <List spacing={3} my={0} color='text'>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color='green.500' />
            <ChakraLink
              isExternal
              href='https://chakra-ui.com'
              flexGrow={1}
              mr={2}
            >
              Chakra UI <LinkIcon />
            </ChakraLink>
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color='green.500' />
            <ChakraLink
              isExternal
              href='https://nextjs.org'
              flexGrow={1}
              mr={2}
            >
              Next.js <LinkIcon />
            </ChakraLink>
          </ListItem>
        </List>
      </Main>

      {/* <CTA /> */}
    </Container>
  </>
);

export default Index;
