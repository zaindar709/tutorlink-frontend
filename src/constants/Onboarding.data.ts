import Images from "../assets/images";
import useUi from "../ui/useUi";
// const {colors} = useUi();
export const getOnboardingData = (colors: any) =>   [
  {
    id: '1',
    title: 'One-on-One Live Sessions',
    description: 'Connect instantly with expert tutors for personalized learning.',
    image: Images.OneOnOne,
    // color: colors.PRIMARY_COLOR as string,
  },
  {
    id: '2',
    title: 'AI-Powered Academic Insights',
    description: 'Strengths and weaknesses, and get personalized study plans.',
    image: Images.AIPoweredInsights,
    color:  colors.PRIMARY_COLOR as string,
  },
  {
    id: '3',
    title: 'Track your Progress',
    description: 'Monitor learning progress, session history, and achievements.',
    image: Images.TrackProgress,
    color:  colors.PRIMARY_COLOR as string,
  },
];