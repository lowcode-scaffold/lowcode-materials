import mitt from 'mitt';

type Events = {
  chatGPTChunck: { text?: string };
  chatGPTComplete: string;
};

export const emitter = mitt<Events>();
