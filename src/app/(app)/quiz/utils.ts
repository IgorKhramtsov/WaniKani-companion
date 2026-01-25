export const completionTitleCopywritings = ['Huzzah! ', 'Hurrah!']

export const completionCopywritings = [
  'Your reviews are complete, forging your path to mastery. Well done, mighty learner!',
  'You’ve conquered your reviews! Your recall is sharper and your knowledge is growing stronger. Keep up the great work!',
]

export const getRandomCopywritings = () => {
  return {
    title:
      completionTitleCopywritings[
        Math.floor(Math.random() * completionTitleCopywritings.length)
      ],
    copy: completionCopywritings[
      Math.floor(Math.random() * completionCopywritings.length)
    ],
  }
}
