export const modelList=[
    {
        id: 1,
        name: 'AIDC-AI/Marco-o1',
        creator: 'AIDC-AI',
        type: '免费',
        description: 'Marco-o1是一个开放模型模型，运用自己已掌握数字服务 MarcoPolo 团队开发。该模型不仅专注于数学、物理和编程等标准答案领域，更重视...',
        avatar: '/path/to/avatar.png',
        tags: ['对话', '7B', '32K']
      },
      {
        id: 2,
        name: 'deepseek-ai/DeepSeek-R1',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1是一款强化学习（RL）驱动的推理模型，解决了模型中的复杂任务和逻辑问题。在 RL 之前，DeepSeek-R1引入了冷启动数据，进一步优化了推理性能，它在数学、代码和推理任务中与 OpenAI-a1 表现相当，并且通过精心设计的训练方法，提升了整体效果。',
        avatar: '/path/to/deepseek-r1.png',
        tags: ['对话', '推理模型', 'MoE', '671B', '64K'],
      },
      {
        id: 3,
        name: 'deepseek-ai/DeepSeek-V3',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-V3 是一款拥有 670 亿参数的混合专家（MoE）语言模型，采用多头循注注意力（MLA）和 DeepSeekMoE 架构，结合无损助长的灵活平衡策略，优化推理和训练效率，通过在 14.8 万亿高质量tokens上预训练，并进行监督微调和强化学习，DeepSeek-V3 在性能...',
        avatar: '/path/to/deepseek-v3.png',
        tags: ['对话', 'Tools', 'MoE', '671B', '64K'],
      },
      {
        id: 4,
        name: 'Pro/deepseek-ai/DeepSeek-R1',
        creator: 'DeepSeek',
        type: '付费',
        description: 'DeepSeek-R1是一款强化学习（RL）驱动的推理模型，解决了模型中的复杂任务和逻辑问题。在 RL 之前，DeepSeek-R1引入了冷启动数据，进一步优化了推理性能，它在数学、代码和推理任务中与 OpenAI-a1 表现相当，并且通过精心设计的训练方法，提升了整体效果。',
        avatar: '/path/to/pro-deepseek-r1.png',
        tags: ['对话', '推理模型', 'MoE', '671B', '64K'],
      },
      {
        id: 5,
        name: 'Pro/deepseek-ai/DeepSeek-V3',
        creator: 'DeepSeek',
        type: '付费',
        description: 'DeepSeek-V3 是一款拥有 670 亿参数的混合专家（MoE）语言模型，采用多头循注注意力（MLA）和 DeepSeekMoE 架构，结合无损助长的灵活平衡策略，优化推理和训练效率，通过在 14.8 万亿高质量tokens上预训练，并进行监督微调和强化学习，DeepSeek-V3 在性能...',
        avatar: '/path/to/pro-deepseek-v3.png',
        tags: ['对话', 'Tools', 'MoE', '671B', '64K'],
      },
      {
        id: 6,
        name: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Llama-70B 基于于 Llama-3-70B-Instruct 经过蒸馏训练得到的模型，该模型是 DeepSeek-R1 系列的一部分，通过使用 DeepSeek-R1 生成的样本进行微调，在数学、编程和推理等多个领域展现出优秀的性能，尤其在 AIME 2024、MATH-500、GPQA Diamond...',
        avatar: '/path/to/deepseek-r1-distill-llama-70b.png',
        tags: ['对话', '推理模型', '70B', '32K'],
      },
      {
        id: 7,
        name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Qwen-32B 基于于 Qwen2.5-32B 通过知识蒸馏得到的模型，该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，在数学、编程和推理等多个领域展现出卓越的性能，在 AIME 2024、MATH-500、GPQA Diamond 等多个算准测试中都取得了优异成...',
        avatar: '/path/to/deepseek-r1-distill-qwen-32b.png',
        tags: ['对话', '推理模型', '32B', '32K'],
      },
      {
        id: 8,
        name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Qwen-14B 基于于 Qwen2.5-14B 通过知识蒸馏得到的模型，该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力，在多个基准测试中表现出色，其中在 MATH-500 上达到了 93.9%的准确率，在 AIME 2024 上达到了 69.7%...',
        avatar: '/path/to/deepseek-r1-distill-qwen-14b.png',
        tags: ['对话', '推理模型', '14B', '32K'],
      },
      {
        id: 9,
        name: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Llama-8B 基于于 Llama-3-1-8B 开发的蒸馏模型，该模型使用 DeepSeek-R1 生成的样本进行微调，展现出优秀的推理能力，在多个基准测试中表现优秀，其中在 MATH-500 上达到了 89.1%的准确率，在 AIME 2024 上达到了 50.4%的通过率，在 CodeForces...',
        avatar: '/path/to/deepseek-r1-distill-llama-8b.png',
        tags: ['对话', '推理模型', '8B', '32K'],
      },
      {
        id: 10,
        name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Qwen-7B 是基于 Qwen2.5-Math-7B 通过知识蒸馏得到的模型，该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力，在多个基准测试中表现出...',
        avatar: '/path/to/deepseek-r1-distill-qwen-7b.png',
        tags: ['对话', '推理模型', '7B', '32K', 'Math'],
      },
      {
        id: 11,
        name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Qwen-1.5B 是基于 Qwen2.5-Math-1.5B 通过知识蒸馏得到的模型，该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，在多个基准测试中展现出了惊的性能，作为一个轻...',
        avatar: '/path/to/deepseek-r1-distill-qwen-1.5b.png',
        tags: ['对话', '推理模型', '1.5B', '32K', 'Math'],
      },
      {
        id: 12,
        name: 'Qwen/QVQ-72B-Preview',
        creator: 'QVQ',
        type: '免费',
        description: 'QVQ-72B-Preview 是由 Qwen 团队开发的专注于视觉推理能力的研究型模型，该模型在多项基准测试中表现出，在 MMMU 测试中达到了 70.3% 的通过成绩，在 MathVista 达到 71.4% 的优异表现，展...',
        avatar: '/path/to/qvq-72b-preview.png',
        tags: ['对话', '视觉', '72B', '32K'],
      },
      {
        id: 13,
        name: 'deepseek-ai/DeepSeek-V2.5',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-V2.5-1210 是 DeepSeekV2.5 的升级版本，在多个能力方面都有显著提升。在数学能力方面，其在 MATH-500 基准测试上的表现从 74.8% 提升至 82.8%，在编码方面，LiveCodebench 基准...',
        avatar: '/path/to/deepseek-v2.5.png',
        tags: ['对话', 'FIM', 'Tools', 'MoE', '236B', '32K'],
      },
      {
        id: 14,
        name: 'tencent/HunyuanVideo-HD',
        creator: '腾讯混元',
        type: '免费',
        description: 'HunyuanVideo 是腾讯推出的开源视频生成基础模型，拥有超过 130 亿参数，是目前最大的开源视频生成模型，该模型采用统一的图像和视频生成架构，集成了数据筛选、图像-视频联合训练和增强...',
        avatar: '/path/to/hunyuanvideo-hd.png',
        tags: ['视觉', '13B'],
      },
      {
        id: 15,
        name: 'genmo/mochi-1-preview',
        creator: 'Genmo',
        type: '免费',
        description: 'Mochi 1 是一个开源的视频生成模型，基于新颖的Asymm6D架构构建，该模型具有 100 亿参数规模，模型采用非对称编码器-解码器架构，能够将视频压缩至原始大小的 128 倍，具有 8x8 空间压缩比和 6...',
        avatar: '/path/to/mochi-1-preview.png',
        tags: ['视觉', '10B'],
      },
      {
        id: 16,
        name: 'tencent/HunyuanVideo',
        creator: '腾讯混元',
        type: '免费',
        description: 'HunyuanVideo 是腾讯推出的开源视频生成基础模型，拥有超过 130 亿参数，是目前最大的开源视频生成模型，该模型采用统一的图像和视频生成架构，集成了数据筛选、图像-视频联合...',
        avatar: '/path/to/hunyuanvideo.png',
        tags: ['视觉', '13B'],
      },
      {
        id: 17,
        name: 'fishaudio/fish-speech-1.5',
        creator: 'Fish Audio',
        type: '免费',
        description: 'Fish Speech V1.5 是一款优秀的开源文本转语音（TTS）模型，该模型采用创新的 DualAR 架构，包含双自回归控制器设计，已支持多种语言，其中英语和中文各有超过 30 万分钟的训...',
        avatar: '/path/to/fish-speech.png',
        tags: ['语音', '多语言'],
      },
      {
        id: 18,
        name: 'RVC-Boss/GPT-SoVITS',
        creator: 'RVC-Boss',
        type: '免费',
        description: 'GPT-SoVITS 是一个强大的少样本语音转换和文本转语音系统，其最显著的特点是仅需 1 分钟的训练数据即可实现高质量的声音克隆，模型支持零样本 TTS（仅需 5 秒语音样本）和少样...',
        avatar: '/path/to/gpt-sovits.png',
        tags: ['语音'],
      },
      {
        id: 19,
        name: 'Qwen/QwQ-32B-Preview',
        creator: 'QVQ',
        type: '免费',
        description: 'QwQ-32B-Preview是Qwen 最新的实验性研究模型，专注于提升AI推理能力，通过探索语言混合、通用推理等多项创新，主要优势包括强大的推理分析能力、数学和编程能力，与此同...',
        avatar: '/path/to/qwq-32b-preview.png',
        tags: ['对话', '32B', '32K'],
      },
      {
        id: 20,
        name: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-Coder-32B-Instruct 是基于 Qwen2.5 开发的代码特定大语言模型，该模型通过 5.5 万亿 tokens 的训练，在代码生成、代码理解和代码修复方面都取得了显著提升，它是当前最...',
        avatar: '/path/to/qwen2.5-coder.png',
        tags: ['对话', 'FIM', 'Coder', '32B', '32K'],
      },
      {
        id: 21,
        name: 'black-forest-labs/FLUX.1-schnell',
        creator: 'FLUX.1',
        type: '免费',
        description: 'FLUX.1 [schnell] 是一个 120 亿参数的 Rectified Flow Transformer 模型，能够根据文本描述生成图像，该模型采用最在对抗散度减速技术训练，可以在短时内生成高质量图像，已具有完...',
        avatar: '/path/to/flux-schnell.png',
        tags: ['生成', 'Free', '12B'],
      },
      {
        id: 22,
        name: 'black-forest-labs/FLUX.1-dev',
        creator: 'FLUX.1',
        type: '免费',
        description: 'FLUX.1 [dev] 是一个 120 亿参数的 Rectified Flow Transformer 模型，能够根据文本描述生成图像，该模型具有最先进的输出质量，以次于其先进的模型 FLUX.1 [pro]，已具有完善的...',
        avatar: '/path/to/flux-dev.png',
        tags: ['生成', '12B'],
      },
      {
        id: 23,
        name: 'black-forest-labs/FLUX.1-pro',
        creator: 'FLUX.1',
        type: '免费',
        description: 'FLUX.1 [pro] 是 FLUX.1 系列中性能最强大的图像生成模型，代表了文本到图像生成领域的最新技术水平，该模型在提示词理解、视觉质量、细节程度和细节多样性方面均达到顶尖水平，拥有置...',
        avatar: '/path/to/flux-pro.png',
        tags: ['生成', '12B'],
      },
      {
        id: 24,
        name: 'fishaudio/fish-speech-1.4',
        creator: 'Fish Audio',
        type: '免费',
        description: 'Fish Speech V1.4 是一个先进的文本转语音（TTS）模型，在 70 万小时的多语言音频数据上训练而成，该模型支持 8 种语言，包括约 38 万分钟的英语和中文数据，以及各约 2 万小时的...',
        avatar: '/path/to/fish-speech-1.4.png',
        tags: ['语音', '多语言'],
      },
      {
        id: 25,
        name: 'Qwen/Qwen2-VL-72B-Instruct',
        creator: 'Qwen2',
        type: '免费',
        description: 'Qwen2-VL 是 Qwen-VL 模型的最新迭代版本，在视觉理解基准测试中达到了最先进的性能，包括 MathVista、DocVQA、RealWorldQA 和 MTVQA 等，Qwen2-VL 能够理解超过 20 分钟...',
        avatar: '/path/to/qwen2-vl-72b.png',
        tags: ['对话', '视觉', '72B', '32K'],
      },
      {
        id: 26,
        name: 'OpenGVLab/InternVL2-26B',
        creator: '书生万象',
        type: '免费',
        description: 'InternVL2-26B 是 InternVL2.0 系列多模态大语言模型中的一员，该模型由 InternViT-6B-448px-V1-5 视觉模型、MLP 投影层和 internlm2-chat-20b 语言模型组成，它在各种视觉场景任务上...',
        avatar: '/path/to/internvl2-26b.png',
        tags: ['对话', '视觉', '26B', '32K'],
      },
      {
        id: 27,
        name: 'Lightricks/LTX-Video',
        creator: 'Lightricks',
        type: '免费',
        description: 'LTX-Video 差置个基于 DiT 架构的逐时视频生成模型，能够生成高质量视频，其生成速度甚至快于视频播放速度，该模型支持 24 帧每秒、768x512 分辨率的视频生成，既可以进行文本...',
        avatar: '/path/to/ltx-video.png',
        tags: ['视频', '2B'],
      },
      {
        id: 28,
        name: 'Qwen/Qwen2.5-72B-Instruct-128K',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一，该 72B 模型在编码和数学等领域具有显著改进的能力，它支持长达 128K tokens 的上下文，该模型还提供了多语言支持...',
        avatar: '/path/to/qwen2.5-72b-instruct-128k.png',
        tags: ['对话', 'Tools', '72B', '128K'],
      },
      {
        id: 29,
        name: 'deepseek-ai/deepseek-vl2',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-VL2 是一个基于 DeepSeekMoE-27B 开发的混合专家（MoE）视觉语言模型，采用稀疏激活的 MoE 架构，在仅激活 4.58 亿参数的情况下实现了卓越性能，该模型在视觉问答、...',
        avatar: '/path/to/deepseek-vl2.png',
        tags: ['对话', '视觉', 'MoE', '27B', '4K'],
      },
      {
        id: 30,
        name: 'Qwen/Qwen2.5-72B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一，该 72B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、...',
        avatar: '/path/to/qwen2.5-72b-instruct.png',
        tags: ['对话', 'Tools', '72B', '32K'],
      },
      {
        id: 31,
        name: 'Qwen/Qwen2.5-32B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-32B-Instruct 是阿里云发布的最新大语言模型系列之一，该 32B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、...',
        avatar: '/path/to/qwen2.5-32b-instruct.png',
        tags: ['对话', 'Tools', '32B', '32K'],
      },
      {
        id: 32,
        name: 'Qwen/Qwen2.5-14B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-14B-Instruct 是阿里云发布的最新大语言模型系列之一，该 14B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、...',
        avatar: '/path/to/qwen2.5-14b-instruct.png',
        tags: ['对话', 'Tools', '14B', '32K'],
      },
      {
        id: 33,
        name: 'Qwen/Qwen2.5-7B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-7B-Instruct 是阿里云发布的最新大语言模型系列之一，该 7B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英...',
        avatar: '/path/to/qwen2.5-7b-instruct.png',
        tags: ['对话', 'Tools', 'Free', '7B', '32K'],
      },
      {
        id: 34,
        name: 'Qwen/Qwen2.5-Coder-7B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-Coder-7B-Instruct 是阿里云发布的代码特定大语言模型系列的最新版本，该模型在 Qwen2.5 的基础上，通过 5.5 万亿个 tokens 的训练，显著提升了代码生成、推理和修复能...',
        avatar: '/path/to/qwen2.5-coder-7b-instruct.png',
        tags: ['对话', 'FIM', 'Coder', '7B', '32K'],
      },
      {
        id: 35,
        name: 'TeleAI/TeleChat2',
        creator: '电信',
        type: '免费',
        description: 'TeleChat2大模型是中国电信AI研习社研发的生成式语义大模型，支持咨询问答、代码生成、长文生成等功能，为用户提供对话咨询服务，能够与用户进行对话互动，回答问题，助...',
        avatar: '/path/to/telechat2.png',
        tags: ['对话', '8K'],
      },
      {
        id: 36,
        name: 'internlm/internlm2_5-20b-chat',
        creator: '书生浦语',
        type: '免费',
        description: 'InternLM2.5-20B-Chat 是一个开源的大规模对话模型，基于 InternLM2 架构开发，该模型拥有 200 亿参数，在数学推理方面表现出色，超越了同量级的 Llama3 和 Gemma2-27B 模型，...',
        avatar: '/path/to/internlm2-5-20b-chat.png',
        tags: ['对话', 'Tools', '20B', '32K'],
      },
      {
        id: 37,
        name: 'internlm/internlm2_5-7b-chat',
        creator: '书生浦语',
        type: '免费',
        description: 'InternLM2.5-7B-Chat 是一个开源的对话模型，基于 InternLM2 架构开发，该 7B 参数规模的模型专注于对话生成任务，支持中英双语交互，模型采用了最新的训练技术，首在推流流畅，...',
        avatar: '/path/to/internlm2-5-7b-chat.png',
        tags: ['对话', 'Tools', 'Free', '7B', '32K'],
      },
      {
        id: 38,
        name: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
        creator: 'LLama3.1',
        type: '免费',
        description: 'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调模型，该 405B 指令微调模型针对多语言对话场景进行了优化，在...',
        avatar: '/path/to/meta-llama-3.1-405b.png',
        tags: ['对话', '405B', '32K', '安全'],
      },
      {
        id: 39,
        name: 'stabilityai/stable-diffusion-xl-base-1.0',
        creator: 'Stability AI',
        type: '免费',
        description: 'Stable Diffusion XL (SDXL) 是一个基于潜在扩散的文本到图像生成模型，使用了两个固定的预训练文本编码器（OpenCLIP-ViT/G 和 CLIP-ViT/L），SDXL 由基础模型和精炼模型组成，...',
        avatar: '/path/to/stable-diffusion-xl.png',
        tags: ['生成', '图生图'],
      },
      {
        id: 40,
        name: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        creator: 'LLama3.1',
        type: '免费',
        description: 'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调模型，该 70B 指令微调模型针对多语言对话场景进行了优化，在...',
        avatar: '/path/to/meta-llama-3.1-70b.png',
        tags: ['对话', 'Tools', '70B', '32K', '安全'],
      },
      {
        id: 41,
        name: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        creator: 'LLama3.1',
        type: '免费',
        description: 'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调模型，该 8B 指令微调模型针对多语言对话场景进行了优化，在多...',
        avatar: '/path/to/meta-llama-3.1-8b.png',
        tags: ['对话', 'Tools', 'Free', '8B', '32K', '安全'],
      },
      {
        id: 42,
        name: 'netease-youdao/bce-reranker-base_v1',
        creator: '网易有道',
        type: '免费',
        description: 'bce-reranker-base_v1 是网易有道开发的双语词典语言重排序模型，支持中文、英文、日文和韩文，该模型在 RAG 系统中用于精确重排检索结果，可以提供有意义的相关性分数，有助...',
        avatar: '/path/to/bce-reranker-base.png',
        tags: ['重排序', '多语言', '279M', '512'],
      },
      {
        id: 43,
        name: 'BAAI/bge-reranker-v2-m3',
        creator: '智源研究院',
        type: '免费',
        description: 'BAAI/bge-reranker-v2-m3 是一个轻量级的多语言重排序模型，它基于 bge-m3 模型开发，具有强大的多语言能力，易于部署，并且推理速度快，该模型采用语义和文档行为输入，直接...',
        avatar: '/path/to/bge-reranker-v2-m3.png',
        tags: ['重排序', '多语言', '568M', '8K'],
      },
      {
        id: 44,
        name: 'BAAI/bge-m3',
        creator: '智源研究院',
        type: '免费',
        description: 'BGE-M3 是一个多功能、多语言、多粒度的文本嵌入模型，它支持三种常见的检索功能：密集检索、多向量检索和稀疏检索，该模型可以处理超过100种语言，并且能够处理从短句到...',
        avatar: '/path/to/bge-m3.png',
        tags: ['嵌入', '多语言', '1024维', '8K'],
      },
      {
        id: 45,
        name: 'netease-youdao/bce-embedding-base_v1',
        creator: '网易有道',
        type: '免费',
        description: 'bce-embedding-base_v1 是由网易有道开发的双语词典语言嵌入模型，该模型在中英双语义表示和检索任务中表现出色，尤其擅长跨语言场景，已是为检索增强生成（RAG）系统优化...',
        avatar: '/path/to/bce-embedding-base.png',
        tags: ['嵌入', '多语言', '768维', '279M', '512'],
      },
      {
        id: 46,
        name: 'Qwen/Qwen2-7B-Instruct',
        creator: 'Qwen2',
        type: '免费',
        description: 'Qwen2-7B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 7B，该模型基于 Transformer 架构，采用了 SwGLU 激活函数、注意力 QKV 偏置和相查询注意力等技术，已...',
        avatar: '/path/to/qwen2-7b-instruct.png',
        tags: ['对话', 'Free', '7B', '32K'],
      },
      {
        id: 47,
        name: 'Qwen/Qwen2-1.5B-Instruct',
        creator: 'Qwen2',
        type: '免费',
        description: 'Qwen2-1.5B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 1.5B，该模型基于 Transformer 架构，采用了 SwGLU 激活函数、注意力 QKV 偏置和相查询注意力等技术，已...',
        avatar: '/path/to/qwen2-1.5b-instruct.png',
        tags: ['对话', 'Free', '1.5B', '32K'],
      },
      {
        id: 48,
        name: 'THUDM/glm-4-9b-chat',
        creator: '智谱 AI',
        type: '免费',
        description: 'GLM-4-9B-Chat 是智谱 AI 推出的 GLM-4 系列预训练模型中的开源版本，该模型在语义、数学、推理、代码知识等多个方面表现出色，除了支持多轮对话外，GLM-4-9B-Chat 还具备...',
        avatar: '/path/to/glm-4-9b-chat.png',
        tags: ['对话', 'Tools', 'Free', '9B', '128K'],
      },
      {
        id: 49,
        name: 'THUDM/chatglm3-6b',
        creator: '智谱 AI',
        type: '免费',
        description: 'ChatGLM3-6B 是 ChatGLM 系列的开源模型，由智谱 AI 开发，该模型保留了前代模型的优秀特性，如对话流畅和部署门槛低，同时以工具调用特性、采用了更多样的训练数据，更完...',
        avatar: '/path/to/chatglm3-6b.png',
        tags: ['对话', 'Free', '6B', '32K'],
      },
      {
        id: 50,
        name: '01-ai/Yi-1.5-9B-Chat-16K',
        creator: '零一万物',
        type: '免费',
        description: 'Yi-1.5-9B-Chat-16K 是 Yi-1.5 系列的一个变体，属于开源聊天模型，Yi-1.5 是 Yi 的升级版本，在 500B 个高质量语料上进行了持续预训练，并在 3M 多样化的微调样本上进行了微调，相比...',
        avatar: '/path/to/yi-1.5-9b-chat-16k.png',
        tags: ['对话', 'Free', '9B', '16K'],
      },
      {
        id: 51,
        name: '01-ai/Yi-1.5-6B-Chat',
        creator: '零一万物',
        type: '免费',
        description: 'Yi-1.5-6B-Chat 是 Yi-1.5 系列的一个变体，属于开源聊天模型，Yi-1.5 是 Yi 的升级版本，在 500B 个高质量语料上进行了持续预训练，并在 3M 多样化的微调样本上进行了微调，相比...',
        avatar: '/path/to/yi-1.5-6b-chat.png',
        tags: ['对话', 'Free', '6B', '4K'],
      },
      {
        id: 52,
        name: 'stabilityai/stable-diffusion-3-5-large',
        creator: 'Stability AI',
        type: '免费',
        description: 'Stable Diffusion 3.5 Large 是 Stable Diffusion 系列中最强大的基础模型，拥有 80 亿参数，该模型具有卓越的图像质量和更好的提示适应能力，特别适合在 1 张像素分辨率下进行专业用途...',
        avatar: '/path/to/stable-diffusion-3-5-large.png',
        tags: ['生成', '8B'],
      },
      {
        id: 53,
        name: 'stabilityai/stable-diffusion-3-5-large-turbo',
        creator: 'Stability AI',
        type: '免费',
        description: 'Stable Diffusion 3.5 Large Turbo 是 Stable Diffusion 3.5 Large 的深度版本，该模型能够在仅 4 步内生成高质量图像，并具有出色的提示适应能力，使其比 Stable Diffusion 3.5 Large 快得...',
        avatar: '/path/to/stable-diffusion-3-5-large-turbo.png',
        tags: ['生成', '8B'],
      },
      {
        id: 54,
        name: 'deepseek-ai/Janus-Pro-7B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'Janus-Pro 是一款统一理解与生成的多模态大语言模型 (MLML)，在多模态理解和生成任务中实现了低资源的解耦，其架构基于 DeepSeek-LLM-7b-base，在图像生成方面，模型采用...',
        avatar: '/path/to/janus-pro-7b.png',
        tags: ['生成', '7B'],
      },
      {
        id: 55,
        name: '01-ai/Yi-1.5-34B-Chat-16K',
        creator: '零一万物',
        type: '免费',
        description: 'Yi-1.5-34B-Chat-16K 是 Yi-1.5 系列的一个变体，属于开源聊天模型，Yi-1.5 是 Yi 的升级版本，在 500B 个高质量语料上进行了持续预训练，并在 3M 多样化的微调样本上进行了微调，相...',
        avatar: '/path/to/yi-1.5-34b-chat-16k.png',
        tags: ['对话', '34B', '16K'],
      },
      {
        id: 56,
        name: 'stabilityai/stable-diffusion-3-medium',
        creator: 'Stability AI',
        type: '免费',
        description: 'Stable Diffusion 3 Medium 是由 Stability AI 开发的多模态扩散实验器（MMDIT）文本到图像生成模型，该模型在图像质量、排版、复杂场景理解和渲染效率方面得到重提升，它使用了三个图...',
        avatar: '/path/to/stable-diffusion-3-medium.png',
        tags: ['生成', '2B'],
      },
      {
        id: 57,
        name: 'stabilityai/stable-diffusion-2-1',
        creator: 'Stability AI',
        type: '免费',
        description: 'Stable Diffusion v2-1 是一个基于潜在扩散的文本到图像生成模型，该模型使用固定的预训练 OpenCLIP-ViT/H 文本编码器，可用于生成和修改基于文本提示的图像，它是从 Stable...',
        avatar: '/path/to/stable-diffusion-2-1.png',
        tags: ['生成', '图生图'],
      },
      {
        id: 58,
        name: 'FunAudioLLM/SenseVoiceSmall',
        creator: 'FunAudioLLM',
        type: '免费',
        description: 'SenseVoice 是一个具有多种语音理解能力的语音基础模型，包括自动语音识别（ASR）、口语语音识别（LID）、语音情感识别（SER）和语频事件检测（AED），SenseVoice-Small 模型...',
        avatar: '/path/to/sensevoicesmall.png',
        tags: ['语音', '多语言'],
      },
      {
        id: 59,
        name: 'google/gemma-2-27b-it',
        creator: 'Google',
        type: '免费',
        description: 'Gemma 是由 Google 开发的轻量级、最先进的开放模型系列，采用与 Gemini 模型相同的研究和技术构建，这些模型是仅解码器的大型语言模型，支持英语，提供预训练和指令微调两种...',
        avatar: '/path/to/gemma-2-27b-it.png',
        tags: ['对话', '27B', '8K', '安全'],
      },
      {
        id: 60,
        name: 'google/gemma-2-9b-it',
        creator: 'Google',
        type: '免费',
        description: 'Gemma 是由 Google 开发的轻量级、最先进的开放模型系列之一，它是一个仅解码器的大型语言模型，支持英语，提供开放权重、预训练变体和指令微调变体，Gemma 模型适用于各种...',
        avatar: '/path/to/gemma-2-9b-it.png',
        tags: ['对话', 'Free', '9B', '8K', '安全'],
      },
      {
        id: 61,
        name: 'BAAI/bge-large-zh-v1.5',
        creator: '智源研究院',
        type: '免费',
        description: 'BAAI/bge-large-zh-v1.5 是一个大型中文文本嵌入模型，是 BGE (BAAI General Embedding) 系列的一部分，该模型在 C-MTEB 基准测试中表现出色，在 31 个数据集上的平均得分为...',
        avatar: '/path/to/bge-large-zh-v1.5.png',
        tags: ['嵌入', '中文', '1024维', '335M', '512'],
      },
      {
        id: 62,
        name: 'BAAI/bge-large-en-v1.5',
        creator: '智源研究院',
        type: '免费',
        description: 'BAAI/bge-large-en-v1.5 是一个大型英文文本嵌入模型，是 BGE (BAAI General Embedding) 系列的一部分，它在 MTEB 基准测试中取得了优秀的表现，在 56 个数据集上的平均得分为...',
        avatar: '/path/to/bge-large-en-v1.5.png',
        tags: ['嵌入', '英文', '1024维', '335M', '512'],
      },
      {
        id: 63,
        name: 'AIDC-AI/Marco-o1',
        creator: 'AIDC-AI',
        type: '免费',
        description: 'Marco-o1 是一个开放推理模型，由阿里巴巴国际数字商务 MarcoPolo 团队开发，该模型专门专注于数学、物理和编程等标准答案场景，是首个开放性解决方案，已采用了思维链...',
        avatar: '/path/to/marco-o1.png',
        tags: ['对话', '7B', '32K'],
      },
      {
        id: 64,
        name: 'LoRA/meta-llama/Meta-Llama-3.1-8B-Instruct',
        creator: 'LLama3.1',
        type: '免费',
        description: 'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调模型，该 8B 指令微调模型针对多语言对话场景进行了优化，在多...',
        avatar: '/path/to/meta-llama-3.1-8b.png',
        tags: ['对话', 'Tools', 'Free', '8B', '32K', '安全'],
      },
      {
        id: 65,
        name: 'LoRA/Qwen/Qwen2.5-32B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-32B-Instruct 是阿里云发布的最新大语言模型系列之一，该 32B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文...',
        avatar: '/path/to/qwen2.5-32b-instruct.png',
        tags: ['对话', 'Tools', '32B', '32K'],
      },
      {
        id: 66,
        name: 'LoRA/Qwen/Qwen2.5-14B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-14B-Instruct 是阿里云发布的最新大语言模型系列之一，该 14B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、...',
        avatar: '/path/to/qwen2.5-14b-instruct.png',
        tags: ['对话', 'Tools', '14B', '32K'],
      },
      {
        id: 67,
        name: 'Vendor-A/Qwen/Qwen2.5-72B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一，该 72B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、...',
        avatar: '/path/to/qwen2.5-72b-instruct.png',
        tags: ['对话', 'Tools', '72B', '32K'],
      },
      {
        id: 68,
        name: 'Pro/deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Llama-8B 是基于 Llama-3.1-8B 开发的蒸馏模型，该模型使用 DeepSeek-R1 生成的样本进行微调，展现出优秀的推理能力，在多个基准测试中表现不俗，其中在 MATH...',
        avatar: '/path/to/deepseek-r1-distill-llama-8b.png',
        tags: ['对话', '推理模型', '8B', '32K'],
      },
      {
        id: 69,
        name: 'Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Qwen-7B 是基于 Qwen2.5-Math-7B 通过知识蒸馏得到的模型，该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力，在多个基准测...',
        avatar: '/path/to/deepseek-r1-distill-qwen-7b.png',
        tags: ['对话', '推理模型', '7B', '32K', 'Math'],
      },
      {
        id: 70,
        name: 'Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-R1-Distill-Qwen-1.5B 是基于 Qwen2.5-Math-1.5B 通过知识蒸馏得到的模型，该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，在多个基准测试中展现出不错的性能...',
        avatar: '/path/to/deepseek-r1-distill-qwen-1.5b.png',
        tags: ['对话', '推理模型', '1.5B', '32K', 'Math'],
      },
      {
        id: 71,
        name: 'Pro/Qwen/Qwen2.5-Coder-7B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-Coder-7B-Instruct 是阿里云发布的代码特定大语言模型系列的最新版本，该模型在 Qwen2.5 的基础上，通过 5.5 万亿个 tokens 的训练，显著提升了代码生成、推理和修复能...',
        avatar: '/path/to/qwen2.5-coder-7b-instruct.png',
        tags: ['对话', 'FIM', 'Coder', '7B', '32K'],
      },
      {
        id: 72,
        name: 'Pro/Qwen/Qwen2-VL-7B-Instruct',
        creator: 'Qwen2',
        type: '免费',
        description: 'Qwen2-VL-7B-Instruct 是 Qwen-VL 模型的最新迭代版本，在视觉理解基准测试中达到了最先进的性能，包括 MathVista、DocQA、RealWorldQA 和 MTVQA 等，Qwen2-VL 能够用于高...',
        avatar: '/path/to/qwen2-vl-7b-instruct.png',
        tags: ['对话', '视觉', '7B', '32K'],
      },
      {
        id: 73,
        name: 'Pro/OpenGVLab/InternVL2-8B',
        creator: '书生万象',
        type: '免费',
        description: 'InternVL2-8B 是 InternVL2.0 系列多模态大语言模型中的一员，该模型由 InternViT-300M-448px 骨架模型、MLP 投影层和 internlm2-chat 语言模型组成，它在各种视觉理解任务...',
        avatar: '/path/to/internvl2-8b.png',
        tags: ['对话', '视觉', '8B', '32K'],
      },
      {
        id: 74,
        name: 'Pro/black-forest-labs/FLUX.1-schnell',
        creator: 'FLUX.1',
        type: '免费',
        description: 'FLUX.1 [schnell] 是一个 120 亿参数的 Rectified Flow Transformer 模型，能够根据文本描述生成图像，该模型采用最优的扩散采样技术训练，可以在很快时间内生成高质量图像，它具有更...',
        avatar: '/path/to/flux1-schnell.png',
        tags: ['生成', '12B'],
      },
      {
        id: 75,
        name: 'Pro/BAAI/bge-m3',
        creator: '智源研究院',
        type: '免费',
        description: 'BGE-M3 是一个多功能、多语言、多粒度的文本嵌入模型，它支持三种常见的检索功能：密集检索、多向量检索和稀疏检索，该模型可以处理超过100种语言，并且能够处理从短句到...',
        avatar: '/path/to/bge-m3.png',
        tags: ['嵌入', '多语言', '1024维', '8K'],
      },
      {
        id: 76,
        name: 'Pro/BAAI/bge-reranker-v2-m3',
        creator: '智源研究院',
        type: '免费',
        description: 'BAAI/bge-reranker-v2-m3 是一个轻量级的多语言重排序模型，它基于 bge-m3 模型开发，具有强大的多语言能力，易于部署，并且推理速度快，该模型采用语句和文档作为输入，直接...',
        avatar: '/path/to/bge-reranker-v2-m3.png',
        tags: ['重排序', '多语言', '568M', '8K'],
      },
      {
        id: 77,
        name: 'Pro/Qwen/Qwen2.5-7B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-7B-Instruct 是阿里云发布的最新大语言模型系列之一，该 7B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英...',
        avatar: '/path/to/qwen2.5-7b-instruct.png',
        tags: ['对话', 'Tools', '7B', '32K'],
      },
      {
        id: 78,
        name: 'Pro/meta-llama/Meta-Llama-3.1-8B-Instruct',
        creator: 'LLama3.1',
        type: '免费',
        description: 'Meta Llama 3.1 是由 Meta 开发的多语言大型语言模型家族，包括 8B、70B 和 405B 三种参数规模的预训练和指令微调模型，该 8B 指令微调模型针对多语言对话场景进行了优化，在多...',
        avatar: '/path/to/meta-llama-3.1-8b.png',
        tags: ['对话', '8B', '32K', '安全'],
      },
      {
        id: 79,
        name: 'LoRA/black-forest-labs/FLUX.1-dev',
        creator: 'FLUX.1',
        type: '免费',
        description: 'FLUX.1 [dev] 是一个 120 亿参数的 Rectified Flow Transformer 模型，能够根据文本描述生成图像，该模型具有最先进的输出质量，仅次于其最先进的模型 FLUX.1 [pro]，它具有完美力的...',
        avatar: '/path/to/flux1-dev.png',
        tags: ['生成', '12B'],
      },
      {
        id: 80,
        name: 'LoRA/RVC-Boss/GPT-SoVITS',
        creator: 'RVC-Boss',
        type: '免费',
        description: 'GPT-SoVITS 是一个强大的少样本语音转换和文本转语音系统，具备显著的特点是仅需 1 分钟训练数据即可实现高质量的声音克隆，模型支持零样本 TTS（仅需 5 秒语音样本）和少样...',
        avatar: '/path/to/gpt-sovits.png',
        tags: ['语音'],
      },
      {
        id: 81,
        name: 'LoRA/Qwen/Qwen2.5-72B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一，该 72B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、...',
        avatar: '/path/to/qwen2.5-72b-instruct.png',
        tags: ['对话', 'Tools', '72B', '32K'],
      },
      {
        id: 82,
        name: 'Pro/Qwen/Qwen2-7B-Instruct',
        creator: 'Qwen2',
        type: '免费',
        description: 'Qwen2-7B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 7B，该模型基于 Transformer 架构，采用了 SwGLU 激活函数、注意力 QKV 偏置和相查询注意力等技术，已...',
        avatar: '/path/to/qwen2-7b-instruct.png',
        tags: ['对话', '7B', '32K'],
      },
      {
        id: 83,
        name: 'Pro/Qwen/Qwen2-1.5B-Instruct',
        creator: 'Qwen2',
        type: '免费',
        description: 'Qwen2-1.5B-Instruct 是 Qwen2 系列中的指令微调大语言模型，参数规模为 1.5B，该模型基于 Transformer 架构，采用了 SwGLU 激活函数、注意力 QKV 偏置和相查询注意力等技术，已...',
        avatar: '/path/to/qwen2-1.5b-instruct.png',
        tags: ['对话', '1.5B', '32K'],
      },
      {
        id: 84,
        name: 'LoRA/Qwen/Qwen2.5-7B-Instruct',
        creator: 'Qwen2.5',
        type: '免费',
        description: 'Qwen2.5-7B-Instruct 是阿里云发布的最新大语言模型系列之一，该 7B 模型在编码和数学等领域具有显著改进的能力，该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英...',
        avatar: '/path/to/qwen2.5-7b-instruct.png',
        tags: ['对话', '7B', '32K'],
      },
      {
        id: 85,
        name: 'Pro/THUDM/glm-4-9b-chat',
        creator: '智谱 AI',
        type: '免费',
        description: 'GLM-4-9B-Chat 是智谱 AI 推出的 GLM-4 系列预训练模型中的开源版本，该模型在语言、数学、推理、代码知识等多个方面表现出色，除了支持多轮对话外，GLM-4-9B-Chat 还具备...',
        avatar: '/path/to/glm-4-9b-chat.png',
        tags: ['对话', 'Tools', '9B', '128K'],
      },
      {
        id: 86,
        name: 'Pro/google/gemma-2-9b-it',
        creator: 'Google',
        type: '免费',
        description: 'Gemma 是 Google 开发的轻量级、最先进的开放模型系列之一，它是一个仅解码器的大型语言模型，支持英语，提供开放权重、预训练变体和指令微调变体，Gemma 模型适用于各种...',
        avatar: '/path/to/gemma-2-9b-it.png',
        tags: ['对话', '9B', '8K', '安全'],
      },
      {
        id: 87,
        name: 'deepseek-ai/DeepSeek-V2-Chat',
        creator: 'DeepSeek',
        type: '免费',
        description: 'DeepSeek-V2 是一个强大、经济高效的混合专家（MoE）语言模型，它在 81 万亿个 token 的高质量语料上进行了预训练，并通过监督微调（SFT）和强化学习（RL）进一步提升了模...',
        avatar: '/path/to/deepseek-v2-chat.png',
        tags: ['对话', 'MoE', '236B', '32K'],
      }
]