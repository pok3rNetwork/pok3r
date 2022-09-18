import { Flex, Heading } from '@chakra-ui/react';

export const Hero = ({ title }: { title: string }) => (
  <Flex
    justifyContent='center'
    alignItems='center'
    height='12vh'
    bgGradient='linear(to-l, red, black)'
    bgClip='text'
  >
    <Heading fontSize='6vw'>{title}</Heading>
  </Flex>
);

Hero.defaultProps = {
  title: 'Pok3r',
};
