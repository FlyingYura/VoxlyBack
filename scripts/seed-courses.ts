import { CourseService } from '../services/courseService';
import { FirestoreCourse, COLLECTIONS } from '../lib/firestore';
import { db } from '../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const coursesData: Array<Omit<FirestoreCourse, 'id' | 'createdAt' | 'updatedAt'> & { courseId: string }> = [
  {
    courseId: '1',
    title: 'Англійська мова для початківців',
    language: 'Англійська',
    level: 'Початковий',
    duration: '3 місяці',
    price: 550,
    description: 'Основи англійської мови, граматика, розмовна практика',
    instructor: 'Оксана Шевченко',
    studentsCount: 45,
    topics: [
      {
        id: 't1',
        title: 'Вступ до англійської мови',
        description: 'Основи та загальна інформація про англійську мову',
        order: 1,
        progress: 100,
        subtopics: [
          {
            id: 'st1',
            title: 'Що таке англійська мова?',
            type: 'theory',
            content: 'Англійська мова належить до західногерманської групи індоєвропейської мовної сім\'ї.',
            order: 1
          },
          {
            id: 'st2',
            title: 'Алфавіт та вимова',
            type: 'theory',
            content: 'Англійський алфавіт складається з 26 букв латинського алфавіту.',
            order: 2
          },
          {
            id: 'st3',
            title: 'Базові фрази та привітання',
            type: 'theory',
            content: 'Вміння вітатися та прощатися - це основа будь-якої мови.',
            order: 3
          },
          {
            id: 'st4_test1',
            title: 'Тест: Вступ до англійської мови',
            type: 'test',
            order: 4,
            testId: 'test_t1'
          }
        ]
      },
      {
        id: 't2',
        title: 'Дієслово "to be"',
        description: 'Вивчення дієслова "to be" та його форм',
        order: 2,
        progress: 75,
        subtopics: [
          {
            id: 'st5',
            title: 'Визначення та використання дієслова "to be"',
            type: 'theory',
            content: 'Дієслово "to be" (бути) - це найважливіше дієслово в англійській мові.',
            order: 1
          },
          {
            id: 'st6',
            title: 'Форми дієслова "to be" в Present Simple',
            type: 'theory',
            content: 'У теперішньому часі (Present Simple) дієслово "to be" має три форми.',
            order: 2
          },
          {
            id: 'st7',
            title: 'Форми дієслова "to be" в Past Simple',
            type: 'theory',
            content: 'У минулому часі (Past Simple) дієслово "to be" має дві форми.',
            order: 3
          },
          {
            id: 'st8_test2',
            title: 'Тест: Дієслово "to be"',
            type: 'test',
            order: 4,
            testId: 'test_t2'
          }
        ],
        testId: 'test_t2'
      },
      {
        id: 't3',
        title: 'Present Simple',
        description: 'Вивчення теперішнього простого часу',
        order: 3,
        progress: 0,
        subtopics: [
          {
            id: 'st9',
            title: 'Визначення та використання Present Simple',
            type: 'theory',
            content: 'Present Simple (Теперішній простий час) використовується для регулярних дій та звичок.',
            order: 1
          },
          {
            id: 'st10',
            title: 'Утворення Present Simple',
            type: 'theory',
            content: 'Для більшості дієслів використовується базова форма.',
            order: 2
          },
          {
            id: 'st11',
            title: 'Часові маркери для Present Simple',
            type: 'theory',
            content: 'З Present Simple часто використовуються часові маркери.',
            order: 3
          },
          {
            id: 'st12_test3',
            title: 'Тест: Present Simple',
            type: 'test',
            order: 4,
            testId: 'test_t3'
          }
        ],
        testId: 'test_t3'
      }
    ]
  },
  {
    courseId: '2',
    title: 'Німецька мова - середній рівень',
    language: 'Німецька',
    level: 'Середній',
    duration: '4 місяці',
    price: 600,
    description: 'Поглиблене вивчення німецької мови, бізнес-комунікація',
    instructor: 'Андрій Бондаренко',
    studentsCount: 32,
    topics: [
      {
        id: 't4',
        title: 'Вступ до німецької мови',
        description: 'Основи німецької мови та граматики',
        order: 1,
        progress: 100,
        subtopics: [
          {
            id: 'st11',
            title: 'Що таке німецька мова?',
            type: 'theory',
            content: 'Німецька мова належить до західногерманської групи мов.',
            order: 1
          },
          {
            id: 'st12_de',
            title: 'Алфавіт та вимова',
            type: 'theory',
            content: 'Німецький алфавіт містить 26 стандартних букв плюс додаткові символи.',
            order: 2
          },
          {
            id: 'st13_de',
            title: 'Тест: Вступ до німецької мови',
            type: 'test',
            order: 3,
            testId: 't3'
          }
        ]
      },
      {
        id: 't5',
        title: 'Граматика: Артиклі',
        description: 'Вивчення артиклів в німецькій мові',
        order: 2,
        progress: 50,
        subtopics: [
          {
            id: 'st14_de',
            title: 'Визначення артиклів',
            type: 'theory',
            content: 'В німецькій мові є три визначені артиклі: der, die, das.',
            order: 1
          },
          {
            id: 'st15_de',
            title: 'Відмінки та артиклі',
            type: 'theory',
            content: 'В німецькій мові є чотири відмінки.',
            order: 2
          },
          {
            id: 'st17_de',
            title: 'Тест: Артиклі та відмінки',
            type: 'test',
            order: 4,
            testId: 't4'
          }
        ],
        testId: 't4'
      }
    ]
  },
  {
    courseId: '3',
    title: 'Французька мова для подорожей',
    language: 'Французька',
    level: 'Початковий',
    duration: '2 місяці',
    price: 500,
    description: 'Швидкий курс для тих, хто планує подорож до Франції',
    instructor: 'Ірина Ткаченко',
    studentsCount: 28,
    topics: [
      {
        id: 't6',
        title: 'Базові фрази для подорожей',
        description: 'Основні фрази для спілкування під час подорожі',
        order: 1,
        progress: 0,
        subtopics: [
          {
            id: 'st13',
            title: 'Привітання та знайомство',
            type: 'theory',
            content: 'Базові фрази для привітання та знайомства.',
            order: 1
          },
          {
            id: 'st21_fr',
            title: 'В ресторані та кафе',
            type: 'theory',
            content: 'Корисні фрази для замовлення їжі та напоїв.',
            order: 2
          },
          {
            id: 'st23_fr',
            title: 'Тест: Базові фрази',
            type: 'test',
            order: 4,
            testId: 't6'
          }
        ]
      }
    ]
  },
  {
    courseId: '4',
    title: 'Іспанська мова - продвинутий рівень',
    language: 'Іспанська',
    level: 'Продвинутий',
    duration: '5 місяців',
    price: 600,
    description: 'Поглиблене вивчення іспанської мови та культури',
    instructor: 'Максим Кравчук',
    studentsCount: 18,
    topics: [
      {
        id: 't7',
        title: 'Продвинута граматика',
        description: 'Складні граматичні конструкції',
        order: 1,
        progress: 0,
        subtopics: [
          {
            id: 'st26_es',
            title: 'Складні часові форми',
            type: 'theory',
            content: 'Вивчення складних часових форм.',
            order: 1
          },
          {
            id: 'st27_es',
            title: 'Суб\'юнктив (Subjuntivo)',
            type: 'theory',
            content: 'Subjuntivo - це особлива форма дієслова для вираження сумнівів.',
            order: 2
          },
          {
            id: 'st28_es',
            title: 'Тест: Продвинута граматика',
            type: 'test',
            order: 3,
            testId: 't8'
          }
        ],
        testId: 't8'
      }
    ]
  },
  {
    courseId: '5',
    title: 'Польська мова для роботи',
    language: 'Польська',
    level: 'Середній',
    duration: '3 місяці',
    price: 550,
    description: 'Спеціалізований курс для працевлаштування в Польщі',
    instructor: 'Наталія Савченко',
    studentsCount: 40,
    topics: [
      {
        id: 't8',
        title: 'Бізнес-польська',
        description: 'Польська мова для бізнесу та роботи',
        order: 1,
        progress: 0,
        subtopics: [
          {
            id: 'st31_pl',
            title: 'Ділова кореспонденція',
            type: 'theory',
            content: 'Вивчення правил написання ділових листів.',
            order: 1
          },
          {
            id: 'st32_pl',
            title: 'Співбесіда та CV',
            type: 'theory',
            content: 'Фрази та вирази для проходження співбесіди.',
            order: 2
          },
          {
            id: 'st33_pl',
            title: 'Тест: Бізнес-польська',
            type: 'test',
            order: 3,
            testId: 't10'
          }
        ],
        testId: 't10'
      }
    ]
  },
  {
    courseId: '6',
    title: 'Італійська мова - початковий рівень',
    language: 'Італійська',
    level: 'Початковий',
    duration: '3 місяці',
    price: 500,
    description: 'Основи італійської мови та культури',
    instructor: 'Дмитро Ковальчук',
    studentsCount: 22,
    topics: [
      {
        id: 't9',
        title: 'Основи італійської',
        description: 'Вступ до італійської мови',
        order: 1,
        progress: 0,
        subtopics: [
          {
            id: 'st36_it',
            title: 'Алфавіт та вимова',
            type: 'theory',
            content: 'Італійський алфавіт має 21 букву.',
            order: 1
          },
          {
            id: 'st37_it',
            title: 'Привітання та базові фрази',
            type: 'theory',
            content: 'Базові фрази: Ciao, Buongiorno, Grazie.',
            order: 2
          },
          {
            id: 'st39_it',
            title: 'Тест: Основи італійської',
            type: 'test',
            order: 4,
            testId: 't12'
          }
        ],
        testId: 't12'
      }
    ]
  },
  {
    courseId: '7',
    title: 'Українська мова для іноземців',
    language: 'Українська',
    level: 'Початковий',
    duration: '3 місяці',
    price: 500,
    description: 'Основи української мови для тих, хто хоче вивчити українську',
    instructor: 'Оксана Мельник',
    studentsCount: 35,
    topics: [
      {
        id: 't10',
        title: 'Вступ до української мови',
        description: 'Основи української мови',
        order: 1,
        progress: 0,
        subtopics: [
          {
            id: 'st14',
            title: 'Що таке українська мова?',
            type: 'theory',
            content: 'Українська мова належить до східнослов\'янської групи.',
            order: 1
          },
          {
            id: 'st43_ua',
            title: 'Алфавіт та вимова',
            type: 'theory',
            content: 'Український алфавіт має 33 літери.',
            order: 2
          },
          {
            id: 'st45_ua',
            title: 'Тест: Вступ до української мови',
            type: 'test',
            order: 4,
            testId: 't14'
          }
        ],
        testId: 't14'
      }
    ]
  }
];

async function seedCourses() {
  try {
    console.log('🌱 Початок заповнення БД курсами...');
    
    for (const courseDataWithId of coursesData) {
      const { courseId: desiredId, ...courseData } = courseDataWithId;
      
      const existingCourse = await CourseService.getCourseById(desiredId);
      
      if (existingCourse) {
        console.log(`⏭️  Курс "${courseData.title}" (ID: ${desiredId}) вже існує, пропускаємо...`);
        continue;
      }
      
      const courseRef = db.collection(COLLECTIONS.COURSES).doc(desiredId);
      await courseRef.set({
        ...courseData,
        id: desiredId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      
      console.log(`творено курс: "${courseData.title}" з ID: ${desiredId}`);
    }
    
    console.log('Заповнення БД завершено');
    process.exit(0);
  } catch (error) {
    console.error('Помилка при заповненні БД:', error);
    process.exit(1);
  }
}

seedCourses();

